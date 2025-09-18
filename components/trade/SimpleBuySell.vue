<script setup lang="ts">
	import type { PositionDto } from '~/fetch/dtos/position.dto'
	import { Sides } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const { t } = useI18n()
	const props = defineProps<{
		height?: number
		symbol: string
		isH5?: boolean
		openLarverage?: boolean
		side?: Sides
		price?: number
		position?: PositionDto
		action?: 'open' | 'close'
		close?: () => void
	}>()
	const side = ref<Sides>((props.position?.side as Sides) || Sides.SELL)
	const emit = defineEmits<{
		(event: 'close'): void
	}>()
	const onClose = () => {
		// console.log('close.......')
		props.close && props.close()
		useNuxtApp().$pop()
	}
</script>
<template>
	<div class="simple-buysell">
		<h3 class="flex items-center justify-between pb-4 simple-title">
			<SymbolName :symbol="useSymbolStore().getSymbol(symbol)" class="text-base roboto-bold leading-[0] mr-2" size="20px" />
		</h3>

		<TradeOrder
			:symbol="symbol"
			@close="onClose"
			:position="position"
			:price="price"
			:isH5="true"
			:openLarverage="openLarverage"
			:side="side"
			:action="action"
			@update:side="(val: Sides) => side = val"
			:hideProfitLoss="true"
		/>
	</div>
</template>

<style lang="less" scoped>
	:deep(.trade-container) {
		padding: 0;
		.trade-box {
			padding-bottom: 70px;
		}
		.trade-bts {
			padding: 0;
		}
		.slider-wrapper {
			padding-left: 3px;
			padding-right: 3px;
		}
	}
	.simple-title {
		display: none;
	}
	@media (max-width: 999px) {
		.simple-title {
			display: flex;
		}
		.simple-buysell {
			@apply px-4;
		}
	}
</style>
