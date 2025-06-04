<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import Register from './register.vue'
	import Login from './login.vue'
	import { useStore } from '~/store'
	

	const tabbarHeight = ref(0)
	const navbar = ref()
	const menus = ref<MenuModel[]>([
		{
			name: '注册',
			contentComp: markRaw(Register)
		},
		{
			name: '登录',
			contentComp: markRaw(Login)
		}
	])

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = n - 40 - 40
			if (useStore().isH5) tabbarHeight.value = n - (navbar.value?.clientHeight || 55)
		}
	)

	


	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 40
		if (useStore().isH5) tabbarHeight.value = window?.innerHeight - (navbar.value?.clientHeight || 55)
	})
	onUnmounted(() => {
		menus.value = []
		navbar.value = null
	})
</script>
<template>
	<div class="login-index-container">
		<NavigationBar ref="navbar" :showClose="true" />
		<h1 class="px-6 text-2xl font-bold pt-4 text-center">
			登录 DeepKline
			<p class="text-sm font-normal text-grey py-1">未注册邮箱将自动注册</p>
		</h1>
		<TabBar :menus="menus" :height="tabbarHeight" />

		<div class="p-6 pb-10 absolute bottom-0 left-0 w-full">
			<div class="pb-10 grid grid-flow-col *:flex *:flex-col *:items-center *:justify-center *:py-3 *:text-sm">
				<button><GoogleIcon class="w-10 pb-1" /><span>Google</span></button>
				<button><AppleIcon class="w-10 pb-1" /><span>Apple ID</span></button>
			</div>

			<div class="text-sm text-center text-grey [&_span]:text-main">登录即代表您已仔细阅读并完全理解<span>客户协议</span>,<span>隐私政策</span>,<span>风险披露</span>的全部内容，接受并同意。</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			display: none;
			@apply px-4 flex justify-center items-center border-b-0;
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					@apply text-xl mx-3;
				}
			}
		}
	}
	:deep(.navbar) {
		display: none;
	}

	@media (max-width: 999px) {
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
