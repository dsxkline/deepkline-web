<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = ref([
		{
			id: 1,
			name: '系统通知',
			subName: '',
			desc: 'new hans',
			callback: () => {}
		},
		{
			id: 1,
			name: '预警通知',
			subName: '',
			desc: '12x22x2x22xx222x',
			more: 'CopyDocument',
			callback: () => {}
		},
		{
			id: 1,
			name: '订单通知',
			subName: '',
			desc: '中国',
			callback: () => {}
		},
		
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="通知设置" :hideBack="!push" >
	
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
