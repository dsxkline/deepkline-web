<script setup lang="ts">
	import { usePush } from '~/composable/usePush'
	import Captcha from './captcha.vue'
	import { userFetch } from '~/fetch/user.fetch'

	const email = ref('')
	const usepush = usePush()
	const next = () => {
		usepush(Captcha, {
			email: email.value,
			successCallback: async (code: string) => {
                console.log('success callback:',code)
				// 输入验证码后回调
				const result = await userFetch.login({ userName: email.value, smsCode: code })
                console.log('result',result)
				if (result?.code == 0) {
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

			<div class="form-item mt-8">
				<el-button
					size="large"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', email.indexOf('@') >= 0 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="next"
					:loading="false"
					>下一步</el-button
				>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped></style>
