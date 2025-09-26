<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import Register from './register.vue'
	import { useStore } from '~/store'
	import type { ComponentInternalInstance } from 'vue'
	import { getAppStatusBarHeight, getNavHeight } from '~/composable/useCommon'
	const { t } = useI18n()
	const props = defineProps<{ height?: number,push?:string }>()

	const tabbarHeight = ref(0)
	const navbar = ref()
	const titleBar = ref()
	const menus = computed<MenuModel[]>(()=>[
		{
			name: t('注册'),
			contentComp: markRaw(Register)
		}
	])

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setTabbarHeight()
		}
	)

	function setTabbarHeight() {
		tabbarHeight.value = (props.height || useStore().bodyHeight) - (titleBar.value.clientHeight || 84) - getAppStatusBarHeight()
		if (useStore().isH5) tabbarHeight.value = (props.height || useStore().bodyHeight) - (navbar.value?.clientHeight || getNavHeight()) - (titleBar.value.clientHeight || 84) - getAppStatusBarHeight()
	}

	onMounted(() => {
		console.log('login push',props.push)
		setTabbarHeight()
	})
	onUnmounted(() => {
		navbar.value = null
	})
</script>
<template>
	<div class="login-index-container">
		<AppStatusBar/>
		<NavigationBar ref="navbar" :showClose="true" v-if="push=='btt'"/>
		<h1 class="px-6 text-2xl font-bold pt-4 text-center text-main" ref="titleBar">
			{{ t('登录') }} DeepKline
			<p class="text-sm font-normal text-grey py-2">{{ t('未注册邮箱将自动注册') }}</p>
		</h1>
		<TabBar :menus="menus" :height="tabbarHeight" />

		<div class="p-6 pb-10 absolute bottom-0 left-0 w-full">
			<div class="pb-10 grid grid-flow-col *:flex *:flex-col *:items-center *:justify-center *:py-3 *:text-sm">
				<button><GoogleIcon class="w-10 pb-1" /><span>Google</span></button>
				<button><AppleIcon class="w-10 pb-1" /><span>Apple ID</span></button>
			</div>

			<div class="text-sm text-center text-grey [&_span]:text-main">
				<i18n-t keypath="登录即代表您已仔细阅读并完全理解客户协议,隐私政策,风险披露的全部内容，接受并同意">
					<template #kehuxieyi>
						<span>{{ t('客户协议') }}</span>
					</template>
					<template #yinshizhengce>
						<span>{{ t('隐私政策') }}</span>
					</template>
					<template #fengxianpilu>
						<span>{{ t('风险披露') }}</span>
					</template>
				</i18n-t>
				
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			display: none;
		}
	}
	// :deep(.navbar) {
	// 	display: none;
	// }

	@media (max-width: 999px) {
		.login-index-container{
			height: var(--body-height);
		}
		:deep(.navbar) {
			display: flex;
		}
		:deep(.tabbar-container) {
			.tabbar-header {
				display: none;
				overflow-x: unset;
			}
		}
	}
</style>
