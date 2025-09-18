<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = computed(()=>[
		{
			id: 1,
			name: t('系统消息'),
			callback: () => {}
		},
		{
			id: 1,
			name: t('预警消息'),
			callback: () => {}
		},
		{
			id: 1,
			name: t('交易提醒'),
			callback: () => {}
		},
		
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar :title="t('通知设置')" :hideBack="!push" >
	
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
