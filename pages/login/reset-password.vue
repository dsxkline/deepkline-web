<script setup lang="ts">
	import { MD5 } from 'crypto-js'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { userFetch } from '~/fetch/user.fetch'

	const props = defineProps<{
		email: string
		forgetPassword?: boolean
		validId: string
	}>()
	const password = ref('')
	const password2 = ref('')
	const loading = ref(false)
	const error = ref('')

	function passwordHandle() {
		if (password.value === password2.value) {
			error.value = ''
		}
	}
	function password2Handle() {
		if (password.value.length < 8) {
			error.value = '新密码格式有误，请重新输入'
			return
		}
		if (password.value !== password2.value) {
			error.value = '两次密码输入不一致，请重新输入'
			return
		}
		error.value = ''
	}

	function next() {
		error.value = ''
		if (password.value.length < 8) {
			error.value = '新密码格式有误，请重新输入'
			return
		}
		if (password.value !== password2.value) {
			error.value = '两次密码输入不一致，请重新输入'
			return
		}

		loading.value = true
		const pass = MD5(password.value + props.email).toString()
		userFetch
			.resetPassword(props.email, pass, props.validId)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					// 重置成功
					ElMessage({
						message: '设置密码成功',
						type: 'success'
					})
					// 应该是返回到登录界面
					useNuxtApp().$popRoot(null, 2)
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
	function returnBack() {
		useNuxtApp().$popRoot(null, 1)
	}

	onMounted(() => {})
	onUnmounted(() => {})
</script>
<template>
	<div class="login-index-container">
		<NavigationBar ref="navbar">
			<template #right>
				<button class="flex items-center p-2 px-4">
					<el-icon class="!w-5 !h-5"><Service class="!w-5 !h-5" /></el-icon>
				</button>
			</template>
		</NavigationBar>
		<h1 class="px-6 text-2xl font-bold pt-4 text-center">
			设置密码
			<p class="text-sm font-normal text-grey py-1">请设置一个新密码</p>
		</h1>

		<div class="global-form p-6">
			<div class="form-item my-4">
				<label>输入新密码</label>
				<el-input v-model="password" type="password" size="large" maxlength="20" :placeholder="'密码由8-20位字符组成，包含数字字母组合'" @input="passwordHandle" clearable :show-password="true" />
			</div>
			<div class="form-item my-4">
				<label>重复输入新密码</label>
				<el-input v-model="password2" type="password" size="large" maxlength="20" :placeholder="'密码由8-20位字符组成，包含数字字母组合'" @input="password2Handle" clearable :show-password="true" />
			</div>
			<div class="flex justify-between items-center text-grey text-sm">
				<div class="text-red">
					<span v-if="error">{{ error }}</span>
				</div>
			</div>

			<div class="form-item mt-8">
				<el-button
					:loading="loading"
					@click="next"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', password.length >= 8 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
				>
					确认
				</el-button>

				<div class="p-4 text-grey w-full text-center text-sm cursor-pointer" @click="returnBack">跳过</div>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped></style>
