<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { userFetch } from '~/fetch/user.fetch'
	import { useAvatar } from '~/composable/useAvatar'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import type { UploadFile, UploadProps, UploadProgressEvent, UploadRawFile } from 'element-plus'
	import defaultAvatar from '~/assets/images/default-avatar.svg'
	import Cropper from '~/components/common/Cropper.vue'

	const props = defineProps<{}>()
	const usepush = usePush()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const selectAvatar = ref('')
	const avatarList = ref<string[]>([])
	const avatarLoading = ref(false)
	const avatarError = ref('')
	let alertOne = true

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

	const styles = ['bottts', 'bottts-neutral', 'adventurer', 'avataaars-neutral', 'croodles', 'dylan', 'identicon', 'lorelei', 'notionists', 'pixel-art', 'thumbs']

	const avatarUrls = computed(() => seeds.map(seed => `https://api.dicebear.com/9.x/${selectStyle.value}/svg?seed=${seed}`))

	const selectStyle = ref(styles[0])
	const selectStyleHandle = (item: string) => {
		selectStyle.value = item
	}

	const selectAvatarHandle = (src: string) => {
		selectAvatar.value = src
	}
	const next = () => {
		if (!selectAvatar.value) return
		if (selectAvatar.value == useUserStore().user?.face) return
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
	let rawFile: UploadRawFile | null = null // 原始上传的 file 文件
	const elUploader = ref()
	const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
		rawFile = null
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

	const pushCropper = (img: string | ArrayBuffer) => {
		usepush(Cropper, {
			img: img,
			successCallback: (data: UploadRawFile) => {
				const file = new File([data], 'avatar.png', {
					type: data.type,
					lastModified: Date.now()
				})
				rawFile = file as UploadRawFile
				// 开始上传图片
				elUploader.value && elUploader.value.handleStart(file)
				elUploader.value && elUploader.value.submit()
				rawFile = null
			}
		})
	}

	const beforeAvatarUpload: UploadProps['beforeUpload'] = file => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
		const isValidType = allowedTypes.includes(file.type)
		if (!isValidType) {
			ElMessage.error('Avatar picture must be JPG/PNG/GIF/WEBP format!')
			return false
		} else if (file.size / 1024 / 1024 > 2) {
			ElMessage.error('Avatar picture size can not exceed 2MB!')
			return false
		}
		loading.value = true
		error.value = ''

		// 需要阻止默认上传，进入裁剪
		if (!rawFile) {
			const reader = new FileReader()
			reader.onload = e => {
				e.target?.result && pushCropper(e.target.result)
			}
			reader.readAsDataURL(file)
		}
		console.log('file', rawFile)
		return rawFile ? true : false
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

	function getFaceHistory() {
		if (avatarLoading.value) return
		avatarLoading.value = true
		avatarError.value = ''
		userFetch
			.getFaceHistory()
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					avatarLoading.value = false
					avatarList.value = result.data || []
				} else {
					avatarLoading.value = false
					avatarError.value = result?.msg
				}
			})
			.catch(err => {
				setTimeout(() => {
					avatarLoading.value = false
					avatarError.value = '网络异常，请稍后再试'
				}, 500)
			})
	}

	const imageOnError = (event: Event) => {
		if (event.target) (event.target as HTMLImageElement).src = defaultAvatar
	}
	const returnBack = () => {
		// 检查是否修改了头像但是没保存
		if (selectAvatar.value && useUserStore().user?.face != selectAvatar.value && alertOne) {
			alertOne = false
			ElMessageBox.confirm('头像未保存，是否保存后退出?',{
				title:"提示",
				center:true
			})
				.then(() => {
					next()
				})
				.catch(() => {
					// catch error
					useNuxtApp().$pop()
				})
			return true
		}
		return false;
	}
	onMounted(() => {
		getFaceHistory()
	})
</script>
<template>
	<div class="nickname-container">
		<NavigationBar ref="navbar" title="更新头像" :returnBack="returnBack">
			<template #right>
				<el-button
					:class="['w-full transition-all !py-2 mx-4 !h-8 !text-sm bt-default', selectAvatar ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="next"
					:loading="loading"
					>保存</el-button
				>
			</template>
		</NavigationBar>
		<div class="avatar-container flex flex-col justify-center items-center w-full h-[140px] border-b border-[--transparent10]">
			<div class="face-icon flex items-center justify-center relative w-20 h-20 rounded-full">
				<el-upload
					ref="elUploader"
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
					accept="image/*"
				>
					<img
						@error="imageOnError"
						:src="selectAvatar || useUserStore()?.user?.face || useAvatar()"
						alt="Face Icon"
						class="w-20 h-20 rounded-full bg-[--transparent05]"
						v-if="useUserStore()?.user?.id"
					/>
					<img src="~/assets/images/logo.png" alt="Face Icon" class="w-20 h-20 rounded-full" v-else />

					<button class="absolute bottom-0 right-0 rounded-full bg-[--transparent20] w-6 h-6 flex items-center justify-center" v-if="useUserStore()?.user?.id">
						<el-icon><Edit /></el-icon>
					</button>
				</el-upload>
			</div>
			<div class="flex justify-center items-center text-grey text-sm pt-2" v-if="error">
				<div class="text-red">
					<span v-if="error">{{ error }}</span>
				</div>
			</div>
		</div>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - 140px)' }" :always="false">
			<div class="global-form p-6">
				<ul class="text-sm text-grey list-disc pl-4 *:py-1">
					<li>您今年可以上传 {{useUserStore().user?.editFaceTimes}} 次公开头像，您也可以选择我们提供的备选头像，没有修改限制</li>
					<li>我们会审核您上传的头像，过程需要一定时间，请耐心等待</li>
					<li>上传头像时，请勿使用不雅图片</li>
				</ul>

				<h3 class="pt-6 pb-3" v-if="avatarList?.length">头像历史</h3>
				<div v-if="avatarList?.length && !avatarLoading && !avatarError">
					<ul class="grid grid-cols-5 justify-evenly flex-wrap gap-5">
						<template v-for="item in avatarList">
							<li
								v-if="item"
								@click="selectAvatarHandle(item)"
								:class="[
									'flex items-center justify-center border border-[--transparent01] bg-[--transparent01] rounded-full overflow-hidden w-12 h-12',
									selectAvatar == item ? '!bg-[--transparent10]' : ''
								]"
							>
								<img :src="item" class="w-12 h-12" @error="imageOnError" />
							</li>
						</template>
					</ul>
				</div>
				<div v-if="avatarLoading" v-loading="avatarLoading" class="w-full min-h-[135px]"></div>
				<Error v-if="avatarError" class="w-full min-h-[60px]">
					<button @click="getFaceHistory">重新加载</button>
				</Error>

				<h3 class="pt-6 pb-3">选择头像</h3>
				<div>
					<div class="w-full border-b border-[--transparent05] mb-4">
						<ul class="flex items-center pb-3 justify-between gp-3">
							<template v-for="item in styles">
								<li
									@click="selectStyleHandle(item)"
									:class="[
										'flex items-center justify-center border border-[--transparent01] bg-[--transparent01] rounded-full overflow-hidden',
										selectStyle == item ? '!bg-[--transparent10] !border-2 !border-[rgb(var(--color-brand))]' : ''
									]"
								>
									<img :src="`https://api.dicebear.com/9.x/${item}/svg?seed=default`" class="w-5 h-5" />
								</li>
							</template>
						</ul>
					</div>
					<ul class="flex flex-wrap justify-between gap-3">
						<template v-for="item in avatarUrls">
							<li
								@click="selectAvatarHandle(item)"
								:class="[
									'flex items-center justify-center border border-[--transparent01] bg-[--transparent01] rounded-full overflow-hidden w-12 h-12',
									selectAvatar == item ? '!bg-[--transparent10]' : ''
								]"
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
	:deep(.avatar-uploader .el-loading-mask) {
		border-radius: 999px;
	}
</style>
