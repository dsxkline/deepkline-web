<script lang="ts" setup>
	import { useSymbolStore } from '~/store/symbol'
	import type { Instruments } from '~/fetch/okx/okx.type.d'
	const props = defineProps<{
		symbol: string
	}>()
</script>
<template>
	<div class="kline-footer h-[var(--footer-height)] border-[var(--transparent05)] border-t w-full flex items-center px-4">
		<Indicator :symbol="symbol" />
	</div>
</template>
<style lang="less" scoped>
	.kline-footer {
		position: relative;
		&::before {
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.1;
		}
	}
</style>
