<script lang="ts" setup>
	import { useStore } from '~/store'
	import { usePush, usePushUp } from '~/composable/usePush'
	import MeInfo from './info.vue'

	import LogoFace from '~/components/user/LogoFace.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const push = usePush()
	const pushUp = usePushUp()
	const menus = ref([
		{
			id: 1,
			name: '服务条款',
			callback: () => {
				push(MeInfo)
			}
		},

		{
			id: 2,
			name: '隐私政策',
			callback: () => {}
		},
		{
			id: 3,
			name: '风险与合规披露',
			callback: () => {}
		},
		{
			id: 4,
			name: '关于我们',
			callback: () => {}
		},
		{
			id: 5,
			name: '检查更新',
			subName: '',
			desc: '发现新版本',
			callback: () => {}
		}
	])

	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar title="" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<LogoFace />
			<MenuList :menus="menus" />
			
		</ScrollBar>
	</div>
</template>
