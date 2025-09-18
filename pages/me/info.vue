<script lang="ts" setup>
	import NickName from '~/pages/me/nickname.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import Country from './country.vue'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const menus = computed(() => [
		{
			id: 1,
			name: t('昵称'),
			subName: '',
			desc: useUserStore().user?.nickName,
			callback: () => {
				usepush(NickName)
			}
		},
		{
			id: 1,
			name: 'UID',
			subName: '',
			desc: useUserStore().user?.openId,
			more: 'CopyDocument',
			callback: () => {
				copyText(useUserStore().user?.openId, (err: any) => {
					if (!err) {
						ElMessage({
							message: t('已复制到剪切板'),
							type: 'success'
						})
					} else {
						ElMessage({
							message: t('复制失败'),
							type: 'error'
						})
					}
				})
			}
		},
		{
			id: 1,
			name: t('国家或地区'),
			subName: '',
			desc: '中国',
			callback: () => {
				usepush(Country)
			}
		},
		// {
		// 	id: 1,
		// 	name: '身份认证',
		// 	subName: '',
		// 	desc: '已认证',
		// 	callback: () => {}
		// },
		{
			id: 1,
			name: t('用户等级'),
			subName: '',
			desc: useUserStore().user?.levelCode,
			callback: () => {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('个人资料')" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
