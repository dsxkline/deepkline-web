<script setup lang="ts">
	import { MD5 } from 'crypto-js'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { userFetch } from '~/fetch/user.fetch'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import Captcha from './captcha.vue'
	import type { ComponentInternalInstance } from 'vue'
	import ResetPassword from './reset-password.vue'
import clearPWACaches from '~/composable/clearPWACaches'

	const props = defineProps<{
		email: string
		validId?: string
		ticket?: string
		randstr?: string
	}>()
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const password = ref('')
	let forgetPassword = false
	const requireCaptcha = ref(false) // 是否需要用户行为验证
	let captchaInstance: ComponentInternalInstance | null = null
	const next = ()=>{
		if (requireCaptcha.value) {
			// 如果需要用户行为验证
			// 需要用户行为认证
			const captcha = createCaptcha(useNuxtApp().$config.public.CAPTCHA_APP_ID, captchCallback(false))
			captcha.show()
			return
		}
		nextStep(props.ticket, props.randstr)
	}
	const nextStep = (ticket?:string,randstr?:string) => {
		forgetPassword = false
		
		if (loading.value) return
		loading.value = true
		error.value = ''
		userFetch
			.login({
				userName: props.email,
				password: MD5(password.value + props.email).toString(),
				validId: props.validId,
				ticket,
				randstr
			})
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					// 登录成功
					ElMessage({
						message: '登录成功',
						type: 'success'
					})
					useUserStore().setUser(result.data)
					// 保存cookie
					useCookie('token').value = result.data?.token
					clearPWACaches()
					useNuxtApp().$popRoot(null, 1)
				} else {
					if (result?.code == 100027) {
						requireCaptcha.value = true
					}
					setTimeout(() => {
						loading.value = false
						error.value = result?.msg
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					error.value = '网络异常，请稍后再试'
				}, 500)
			})
	}

	// 定义回调函数
	function captchCallback(isreset: boolean) {
		return (res: ICaptchaResult) => {
			// 此处代码仅为验证结果的展示示例，真实业务接入，建议基于ticket和errorCode情况做不同的业务处理
			console.log('captchCallback', res)
			if (res.ret == 0) {
				if (forgetPassword) {
					// 验证成功进入发送验证码流程
					nextSendEmailValidCode(isreset, res.ticket, res.randstr)
				}else{
					// 直接进入登录
					nextStep(res.ticket, res.randstr)
				}
			} else {
				error.value = res.errMessage
			}
		}
	}

	// 定义验证码js加载错误处理函数
	function loadErrorCallback(isreset: boolean) {
		var appid = useNuxtApp().$config.public.CAPTCHA_APP_ID
		// 生成容灾票据或自行做其它处理
		var ticket = createTicket(appid)
		captchCallback(isreset)({
			ret: 0,
			appid: appid,
			randstr: '@' + Math.random().toString(36).substr(2),
			ticket: ticket,
			errorCode: '1001',
			errMessage: 'jsload_error'
		})
	}

	const forgetPasswordHandle = (e: Event | null, isreset: boolean = false) => {
		error.value = ''
		forgetPassword = true
		// 忘记密码会强制开启用户行为验证并发送邮箱验证码
		try {
			const captcha = createCaptcha(useNuxtApp().$config.public.CAPTCHA_APP_ID, captchCallback(isreset))
			captcha.show()
		} catch (err) {
			console.log(err)
			loadErrorCallback(isreset)
		}
	}

	const nextSendEmailValidCode = (isreset: boolean, ticket?: string, randstr?: string, userIp?: string) => {
		loading.value = true
		error.value = ''
		return userFetch
			.sendEmailCode(props.email, 2, ticket, randstr, userIp)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					// 发送成功进入验证码输入界面
					ElMessage({
						message: '验证码已发送',
						type: 'success'
					})
					if (!isreset) pushCaptchaView()
					else {
						//  重新开始计时
						captchaInstance?.exposed?.resetStart && captchaInstance.exposed.resetStart()
					}
					return true
				} else {
					setTimeout(() => {
						loading.value = false
						error.value = result?.msg
					}, 500)
					if (isreset)
						ElMessage({
							message: result?.msg,
							type: 'error'
						})
					return false
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					error.value = '网络异常，请稍后再试'
				}, 500)
				if (isreset)
					ElMessage({
						message: '网络异常，请稍后再试',
						type: 'error'
					})
				return false
			})
	}

	const pushCaptchaView = () => {
		captchaInstance = usepush(Captcha, {
			email: props.email,
			forgetPassword: forgetPassword,
			successCallback: async (validId: string) => {
				console.log('success callback:', validId)
				if (forgetPassword) {
					// 如果是忘记密码，进入重置密码界面
					usepush(ResetPassword, { email: props.email, forgetPassword: true, validId: validId })
				}
				forgetPassword = false
			},
			resetCallback: async () => {
				// 重新发送验证码
				forgetPasswordHandle(null, true)
				return true
			}
		})
	}
</script>
<template>
	<div class="password-container">
		<NavigationBar ref="navbar" />
		<h1 class="px-6 text-2xl font-bold pt-4 text-center">
			密码登录
			<p class="text-sm font-normal text-grey py-1">未注册邮箱将自动注册</p>
		</h1>
		<div class="global-form p-6">
			<div class="form-item my-4">
				<el-input v-model="password" :placeholder="'请输入8-20位数字字母组合的密码'" size="large" type="password" clearable :show-password="true"></el-input>
			</div>
			<div class="flex justify-between items-center text-grey text-sm">
				<div class="text-red">
					<span v-if="error">{{ error }}</span>
				</div>
				<div class="text-grey cursor-pointer" @click="forgetPasswordHandle">忘记密码?</div>
			</div>

			<div class="form-item mt-8">
				<el-button
					size="large"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', password.length >= 8 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="next"
					:loading="loading"
					>登录</el-button
				>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.global-form {
		.form-item {
			@apply flex flex-col;
		}
	}
</style>
