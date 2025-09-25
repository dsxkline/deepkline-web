<script setup lang="ts">
	import CrypeOrder from '~/components/order/CrypeOrder.vue'
	import { useProvideParent } from '~/composable/useProviderParent'
    const props = defineProps<{
        comp:any
        width?:number,
        contentParams?:any
    }>()
	useProvideParent()
    onMounted(() => {
        // console.log('menu content props',props)
    })
</script>
<template>
	<div class="overflow-hidden menu-container parent-push-container relative h-full" :style="[width?'width:'+width+'px':'width:500px']">
		<component :is="comp" v-bind="contentParams" />
	</div>
</template>
<style lang="less" scoped>
	.menu-container {
		// background: rgb(var(--color-bg-base));
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
			opacity: 0.2;
		}
	}
</style>
