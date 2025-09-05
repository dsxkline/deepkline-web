<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	import { useUserStore } from '~/store/user'
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = ref([
		{
			id: 1,
			name: '重置密码',
			callback: () => {}
		},
		{
			id: 1,
			name: '绑定手机号',
			desc: useUserStore().user?.tel || '未绑定',
			callback: () => {}
		},
		{
			id: 1,
			name: '绑定邮箱',
			subName: '',
			desc: useUserStore().user?.email || '未绑定',
			callback: () => {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar title="安全设置" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
