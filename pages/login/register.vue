<script setup lang="ts">
	import { usePush } from '~/composable/usePush'
	import Captcha from './captcha.vue'
	import { userFetch } from '~/fetch/user.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	useHead({
		script: [{ src: 'https://turing.captcha.qcloud.com/TCaptcha.js' }]
	})
	// 定义回调函数
	function captchCallback(res: ICaptchaResult) {
		// 此处代码仅为验证结果的展示示例，真实业务接入，建议基于ticket和errorCode情况做不同的业务处理
        console.log('captchCallback',res)
		if (res.ret==0) {
			// 验证成功进入发送验证码流程
			nextSendValidCode()
		} else {
			error.value = res.errMessage
		}
	}

	// 定义验证码js加载错误处理函数
	function loadErrorCallback() {
		var appid = useNuxtApp().$config.public.CAPTCHA_APP_ID
		// 生成容灾票据或自行做其它处理
		var ticket = createTicket(appid)
		captchCallback({
            ret:0,
            appid:appid,
			randstr: '@' + Math.random().toString(36).substr(2),
			ticket: ticket,
			errorCode: '1001',
			errMessage: 'jsload_error'
		})
	}

	const email = ref('')
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const next = () => {
		loading.value = true
		error.value = ''
		const captcha = createCaptcha(useNuxtApp().$config.public.CAPTCHA_APP_ID, captchCallback)
		userFetch
			.checkEmail({ email: email.value })
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					const isRegister = result.data?.isRegister // 是否已注册
					const isValid = result.data?.isValid // 是否触发验证码
					// 已注册，可以直接进入输入密码界面，触发安全风控就提示验证码62
					// 调用方法，显示验证码
					try {
						if (isValid) captcha.show()
						else {
							nextSendValidCode()
						}
					} catch (err) {
						loadErrorCallback()
					}
				} else {
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
	const nextSendValidCode = () => {
		usepush(Captcha, {
			email: email.value,
			successCallback: async (code: string) => {
				console.log('success callback:', code)
				// 输入验证码后回调
				const result = await userFetch.login({ userName: email.value, smsCode: code })
				console.log('result de', FetchResultDto.OK, result)
				if (result?.code == FetchResultDto.OK) {
					return true
				} else {
					throw new Error(result?.msg)
				}
			}
		})
	}
</script>
<template>
	<div class="register-container">
		<div class="global-form p-6">
			<div class="form-item my-4">
				<!-- <label>邮箱登录:</label> -->
				<el-input v-model="email" :placeholder="'请输入邮箱 例如: 123@gmail.com'" size="large" />
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
					@click="next"
					:loading="loading"
					>下一步</el-button
				>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped></style>
