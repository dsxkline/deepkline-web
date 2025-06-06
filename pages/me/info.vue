<script lang="ts" setup>
	import NickName from '~/pages/me/nickname.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const menus = computed(()=>[
		{
			id: 1,
			name: '昵称',
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
							message: '已复制到剪切板',
							type: 'success'
						})
					} else {
						ElMessage({
							message: '复制失败',
							type: 'error'
						})
					}
				})
			}
		},
		{
			id: 1,
			name: '国家或地区',
			subName: '',
			desc: '中国',
			callback: () => {}
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
			name: '用户等级',
			subName: '',
			desc: useUserStore().user?.levelCode,
			callback: () => {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="个人资料" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
