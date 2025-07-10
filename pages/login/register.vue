<script setup lang="ts">
	import { usePush } from '~/composable/usePush'
	import Captcha from './captcha.vue'
	import { userFetch } from '~/fetch/user.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { ComponentInternalInstance } from 'vue'
	import { useUserStore } from '~/store/user'
	import Password from './password.vue'
	import ResetPassword from './reset-password.vue'
	import clearPWACaches from '~/composable/clearPWACaches'
	import { accountFetch } from '~/fetch/account.fetch'
	import { useAccountStore } from '~/store/account'

	// 定义回调函数
	function captchCallback(isreset: boolean, isRegister?: boolean) {
		return (res: ICaptchaResult) => {
			// 此处代码仅为验证结果的展示示例，真实业务接入，建议基于ticket和errorCode情况做不同的业务处理
			console.log('captchCallback', res)
			if (res.ret == 0) {
				if (isRegister) {
					usepush(Password, { email: email.value, ticket: res.ticket, randstr: res.randstr,isRegister })
				} else {
					// 验证成功进入发送验证码流程
					nextSendEmailValidCode(isreset, res.ticket, res.randstr)
				}
			} else {
				error.value = res.errMessage
			}
		}
	}

	// 定义验证码js加载错误处理函数
	function loadErrorCallback(isreset: boolean, isRegister?: boolean) {
		var appid = useNuxtApp().$config.public.CAPTCHA_APP_ID
		// 生成容灾票据或自行做其它处理
		var ticket = createTicket(appid)
		captchCallback(
			isreset,
			isRegister
		)({
			ret: 0,
			appid: appid,
			randstr: '@' + Math.random().toString(36).substr(2),
			ticket: ticket,
			errorCode: '1001',
			errMessage: 'jsload_error'
		})
	}

	const email = ref(localStorage.getItem('email') || '')
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	let captchaInstance: ComponentInternalInstance | null = null
	const forgetPassword = ref(false)
	const nextStep = () => {
		error.value = ''
		// 忘记密码会强制开启用户行为验证并发送邮箱验证码
		if (email.value.indexOf('@') < 0) {
			error.value = '请输入邮箱账号'
			return
		}
		next()
	}
	const next = (isreset: boolean = false) => {
		if (loading.value) return
		loading.value = true
		error.value = ''

		return userFetch
			.checkEmail({ email: email.value })
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					const isRegister = result.data?.isRegister // 是否已注册
					const isValid = result.data?.isValid // 是否触发验证码
					const openCaptcha = result.data?.openCaptcha // 是否开启行为验证
					// 已注册，可以直接进入输入密码界面，触发安全风控就提示验证码62
					// 调用方法，显示验证码
					try {
						if (isRegister && !isValid) {
							usepush(Password, { email: email.value, isRegister,openCaptcha })
							return false
						}
						if (isValid && openCaptcha) {
							const captcha = createCaptcha(useNuxtApp().$config.public.CAPTCHA_APP_ID, captchCallback(isreset, isRegister))
							captcha.show()
							return false
						} else {
							return nextSendEmailValidCode(isreset)
						}
					} catch (err) {
						loadErrorCallback(isreset, isRegister)
						ElMessage({
							message: '验证码发送异常，请稍后再试',
							type: 'error'
						})
						return false
					}
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
	const nextSendEmailValidCode = (isreset: boolean, ticket?: string, randstr?: string, userIp?: string) => {
		loading.value = true
		error.value = ''
		return userFetch
			.sendEmailCode(email.value, forgetPassword.value ? 2 : 0, ticket, randstr, userIp)
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
			email: email.value,
			forgetPassword: forgetPassword.value,
			successCallback: async (validId: string) => {
				console.log('success callback:', validId)
				// 如果是忘记密码，进入重置密码界面
				if (forgetPassword.value) {
					usepush(ResetPassword, { email: email.value, forgetPassword: forgetPassword.value, validId: validId })
					return true
				}
				// 否则就是登录校验验证码后进行登录操作
				// 输入验证码后回调
				const result = await userFetch.login({ userName: email.value, validId: validId })
				console.log('result de', FetchResultDto.OK, result)
				if (result?.code == FetchResultDto.OK) {
					useUserStore().setUser(result.data)
					// 保存cookie
					useCookie('token').value = result.data?.token
					localStorage.setItem('email', email.value)
					useNuxtApp().$dkws.reconnect()
					setTimeout(async () => {
						await getUserAccounts()
						ElMessage({
							message: '登录成功',
							type: 'success'
						})

						clearPWACaches()
						useNuxtApp().$pop()
						useNuxtApp().$pop()
					})
					return true
				} else {
					throw new Error(result?.msg)
				}
			},
			resetCallback: async () => {
				// 重新发送验证码
				const result = await next(true)
				return result
			}
		})
	}

	async function getUserAccounts() {
		if (!useUserStore().user) return
		const result = await accountFetch.list()
		if (result?.code == FetchResultDto.OK) {
			console.log('获取账户信息', result.data)
			const accounts = result.data
			if (accounts) {
				useAccountStore().setAccounts(accounts)
			}
		} else {
			throw new Error(result?.msg)
		}
	}
</script>
<template>
	<div class="register-container">
		<div class="global-form p-6">
			<div class="form-item my-4">
				<!-- <label>邮箱登录:</label> -->
				<el-input v-model="email" :placeholder="'请输入邮箱 例如: 123@gmail.com'" size="large" inputmode="email" @keydown.enter="nextStep" />
			</div>
			<div class="flex justify-between items-center text-grey text-sm">
				<div class="text-red">
					<span v-if="error">{{ error }}</span>
				</div>
			</div>

			<div class="form-item mt-8">
				<el-button
					size="large"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', email.indexOf('@') >= 0 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="nextStep"
					:loading="loading"
					>下一步</el-button
				>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped></style>
