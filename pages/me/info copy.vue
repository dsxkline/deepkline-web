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
			name: 'chong',
			subName: '',
			desc: 'new hans',
			callback: () => {}
		},
		{
			id: 1,
			name: 'UID',
			subName: '',
			desc: '12x22x2x22xx222x',
            more:"CopyDocument",
			callback: () => {}
		},
        {
			id: 1,
			name: '国家或地区',
			subName: '',
			desc: '中国',
			callback: () => {}
		},
        {
			id: 1,
			name: '身份认证',
			subName: '',
			desc: '已认证',
			callback: () => {}
		},
        {
			id: 1,
			name: '手续费等级',
			subName: '',
			desc: 'Lv1 1 / 0.1%',
			callback: () => {}
		},
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
