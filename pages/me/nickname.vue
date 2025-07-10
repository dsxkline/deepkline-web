<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { userFetch } from '~/fetch/user.fetch'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'

	const props = defineProps<{}>()
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const nickName = ref(useUserStore().user?.nickName)

	const next = () => {
		if (!nickName.value) return
		if (loading.value) return
		loading.value = true
		error.value = ''
		userFetch
			.updateNickFace(nickName.value)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					const user = useUserStore().user
					if (user && nickName.value) user.nickName = nickName.value
					if (user) user.editNicknameTimes = user.editNicknameTimes - 1
					ElMessage({
						message: '昵称修改请求已提交，请耐心等待审核通知',
						type: 'success',
					})
					setTimeout(() => {
						useNuxtApp().$pop()
					}, 600)
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
</script>
<template>
	<div class="nickname-container">
		<NavigationBar ref="navbar" title="修改昵称" />

		<div class="global-form p-6">
			<div class="form-item my-4">
				<el-input v-model="nickName" :placeholder="'请输入昵称'" size="large" maxlength="20" minlength="3" clearable show-word-limit></el-input>
			</div>
			<div class="flex justify-between items-center text-grey text-sm">
				<div class="text-red">
					<span v-if="error">{{ error }}</span>
				</div>
			</div>
			<ul class="text-sm text-grey list-disc pl-4 *:py-1">
				<li>您今年还有{{useUserStore().user?.editNicknameTimes}}次机会修改</li>
				<li>格式：由语言字母开头，可包含数字、emoji、_ - .和空格，长度限制3-30个字符</li>
				<li>我们会审核您提交的昵称，过程需要一定时间，请耐心等待</li>
				<li>创建昵称时，请勿使用不雅用词、官方名称和其他交易平台的名称</li>
			</ul>

			<div class="form-item mt-8">
				<el-button
					size="large"
					:class="[
						'w-full transition-all !py-3 !h-auto !text-sm bt-default',
						nickName && nickName?.length >= 3 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]'
					]"
					@click="next"
					:loading="loading"
					>提交</el-button
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
