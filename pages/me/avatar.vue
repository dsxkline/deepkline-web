<script setup lang="ts">
	import { MD5 } from 'crypto-js'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { userFetch } from '~/fetch/user.fetch'
	import { useAvatar } from '~/composable/useAvatar'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import type { UploadFile, UploadProps, UploadProgressEvent } from 'element-plus'

	const props = defineProps<{}>()
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const selectAvatar = ref('')

	const seeds = [
		'moonwalker',
		'pixelcat',
		'rainbowfish',
		'stormrider',
		'codewizard',
		'firefox',
		'greentea',
		'tinygiant',
		'softbear',
		'sushilover',
		'sunflower',
		'cloudskater',
		'robotron',
		'cyberduck',
		'sandyfeet',
		'midnightfox',
		'bookworm',
		'honeybee',
		'ninjapanda',
		'leafblade',
		'bubbletea',
		'oceanwhale',
		'spaceowl',
		'quietwolf',
		'icecreamking',
		'redpanda',
		'dreamcatcher',
		'tofuchef',
		'stormkite',
		'echohawk'
	]

	const avatarUrls = seeds.map(seed => `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`)

	const selectAvatarHandle = (src: string) => {
		selectAvatar.value = src
	}
	const next = () => {
		if (!selectAvatar.value) return
		if (loading.value) return
		loading.value = true
		error.value = ''
		userFetch
			.updateNickFace('', selectAvatar.value)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					const user = useUserStore().user
					if (user) user.face = selectAvatar.value
					if (selectAvatar.value.indexOf('https://api.dicebear.com') >= 0) {
						ElMessage({
							message: '更新成功',
							type: 'success'
						})
					} else {
						ElMessage({
							message: '头像修改请求已提交，请耐心等待审核通知',
							type: 'success'
						})
					}

					setTimeout(() => {
						useNuxtApp().$pop()
					}, 300)
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

	const imageUrl = ref('')
	const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
		if (response?.code == FetchResultDto.OK) {
			imageUrl.value = response?.data
			loading.value = false
			selectAvatar.value = imageUrl.value
		} else {
			setTimeout(() => {
				error.value = response?.msg
				imageUrl.value = ''
				loading.value = false
			}, 500)
		}
	}

	const beforeAvatarUpload: UploadProps['beforeUpload'] = rawFile => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
		const isValidType = allowedTypes.includes(rawFile.type)
		if (!isValidType) {
			ElMessage.error('Avatar picture must be JPG/PNG/GIF/WEBP format!')
			return false
		} else if (rawFile.size / 1024 / 1024 > 2) {
			ElMessage.error('Avatar picture size can not exceed 2MB!')
			return false
		}
		loading.value = true
		error.value = ''

		return true
	}
	const handlePreview: UploadProps['onPreview'] = file => {
		console.log(file)
		imageUrl.value = URL.createObjectURL(file.raw!)
	}

	function handleError(err: Error) {
		loading.value = false
		error.value = err.message
		imageUrl.value = ''
	}

	const uploadPercent = ref(0)

	function handleProgress(event: UploadProgressEvent, uploadFile: UploadFile) {
		uploadPercent.value = Math.round((event.loaded / event.total) * 100)
	}
</script>
<template>
	<div class="nickname-container">
		<NavigationBar ref="navbar" title="更新头像">
			<template #right>
				<el-button
					:class="['w-full transition-all !py-2 !h-8 !text-xs bt-default', selectAvatar ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="next"
					:loading="loading"
					>保存</el-button
				>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }" :always="false">
			<div class="global-form p-6">
				<div class="form-item my-4 justify-center items-center">
					<div class="face-icon flex items-center justify-center relative w-20 h-20 rounded-full">
						<el-upload
							class="avatar-uploader"
							:action="userFetch.getUploadUrl()"
							:headers="{
								authorization: 'Bearer ' + useCookie('token').value
							}"
							:show-file-list="false"
							:on-success="handleAvatarSuccess"
							:before-upload="beforeAvatarUpload"
							:on-progress="handleProgress"
							:on-error="handleError"
							:on-preview="handlePreview"
							v-loading="loading"
						>
							<img :src="selectAvatar || useUserStore()?.user?.face || useAvatar()" alt="Face Icon" class="w-20 h-20 rounded-full bg-[--transparent05]" v-if="useUserStore()?.user?.id" />
							<img src="~/assets/images/logo.png" alt="Face Icon" class="w-20 h-20 rounded-full" v-else />

							<button class="absolute bottom-0 right-0" v-if="useUserStore()?.user?.id">
								<el-icon><Edit /></el-icon>
							</button>
						</el-upload>
					</div>
				</div>
				<div class="flex justify-center items-center text-grey text-sm pb-4">
					<div class="text-red">
						<span v-if="error">{{ error }}</span>
					</div>
				</div>
				<ul class="text-sm text-grey list-disc pl-4 *:py-1">
					<li>您今年可以上传10次公开头像，您也可以选择我们提供的备选头像，没有修改限制</li>
					<li>我们会审核您上传的头像，过程需要一定时间，请耐心等待</li>
					<li>上传头像时，请勿使用不雅图片</li>
				</ul>

				<h3 class="pt-6 pb-3">选择头像</h3>
				<div>
					<ul class="grid grid-cols-5 gap-1">
						<template v-for="item in avatarUrls">
							<li
								@click="selectAvatarHandle(item)"
								:class="['flex items-center justify-center p-3 border border-[--transparent01] bg-[--transparent01]', selectAvatar == item ? '!bg-[--transparent10]' : '']"
							>
								<img :src="item" class="w-12" />
							</li>
						</template>
					</ul>
				</div>
			</div>
		</ScrollBar>
	</div>
</template>

<style lang="less" scoped>
	.global-form {
		.form-item {
			@apply flex flex-col;
		}
	}
	:deep(.el-loading-mask) {
		border-radius: 999px;
	}
</style>
