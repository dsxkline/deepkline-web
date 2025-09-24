<script setup lang="ts">
	import CrypeOrder from '~/components/order/CrypeOrder.vue'
	import { getHeaderHeight, getNavHeight, getStatusBarHeight, getTabbarHeight } from '~/composable/useCommon'
	import { useProvideParent } from '~/composable/useProviderParent'
	import { useStore } from '~/store'
    const {t} = useI18n()
    const props = defineProps<{
        width?:number,
        contentParams?:any
    }>()
	useProvideParent()
	const tabbarHeight = computed(() => {
		return useStore().bodyHeight - getHeaderHeight() - getStatusBarHeight() - getNavHeight()
	})
</script>
<template>
	<div class="overflow-hidden order-container parent-push-container relative" :style="[width?'width:'+width+'px':'width:500px']">
		<NavigationBar :title="t('订单')" :hideBack="true"></NavigationBar>
		<CrypeOrder :height="tabbarHeight" />
	</div>
</template>
<style lang="less">
	.order-container {
		// background: var(--transparent01);
		&::before {
			background-image: var(--bg-linear-180);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.08;
		}

		.tabbar-container{
			.tabbar-header {
				background: transparent;
				&::before {
					background-image: none;
				}
			}
		}
	}
</style>
