<script lang="ts" setup>
	import { useStore } from '~/store'
	import { usePush, usePushUp } from '~/composable/usePush'
	import MeInfo from './info.vue'

	import LogoFace from '~/components/user/LogoFace.vue'
	import Service from './service.vue'
	import Privacy from './privacy.vue'
	import Aboutus from './aboutus.vue'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const push = usePush()
	const pushUp = usePushUp()
	const menus = computed(()=>[
		{
			id: 1,
			name: t('服务条款'),
			callback: () => {
				push(Service)
			}
		},

		{
			id: 2,
			name: t('隐私政策'),
			callback: () => {
				push(Privacy)
			}
		},
		// {
		// 	id: 3,
		// 	name: '风险与合规披露',
		// 	callback: () => {}
		// },
		{
			id: 4,
			name: t('关于我们'),
			callback: () => {
				push(Aboutus)
			}
		},
		{
			id: 5,
			name: t('检查更新'),
			subName: '',
			desc: t('发现新版本'),
			callback: () => {}
		}
	])

	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar title="" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<LogoFace />
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
