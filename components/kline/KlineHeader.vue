<script lang="ts" setup>
	const props = defineProps<{
		symbol: string
	}>()
</script>
<template>
	<div class="kline-header px-1 pl-6 h-[var(--footer-height)] border-[var(--transparent05)] border-b w-full flex items-center">
		<SymbolTitle :symbol="symbol" />
		<SymbolTools :symbol="symbol" class="ml-3"/>
		<el-divider direction="vertical"></el-divider>
		<CycleBar :symbol="symbol" />
	</div>
</template>
<style lang="less" scoped>
.light{
	.kline-header {
		&::before {
			opacity: 0.2;
			background-image: none;
		}
	}
}
	.kline-header {
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
