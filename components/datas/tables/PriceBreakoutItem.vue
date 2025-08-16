<script setup lang="ts">
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	import { usePush } from '~/composable/usePush'
	import type { PriceSupportDto } from '~/fetch/dtos/symbol.dto'
	import type { Ticker } from '~/fetch/okx/okx.type'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		item: PriceSupportDto
	}>()

	watch(()=>props.item.symbol,()=>{
        props.item?.symbol && $ws.removeTickerHandler(props.item?.symbol, tickerHandler)
        props.item?.symbol && $ws.addTickerHandler(props.item?.symbol, tickerHandler)
        setPosition()
    })

	const push = usePush()
	function clickSymbol(item?: PriceSupportDto) {
		if (useStore().isH5) {
			const params = {
				symbol: item?.symbol
			}
			push(SymbolDetail, params)
			return
		}
	}
	const { $wsb, $ws } = useNuxtApp()
	function setPosition() {
		const item = props.item
		const ticker = $ws.getTickers(item.symbol)
		if (!ticker) return
		// 当前价
		const price = parseFloat(ticker.last)
		// 距离
		// 记录价格突破，分数是越接近越高
		const distance = distancePercent(price, item.support, item.resistance)
		// 距离压力位的距离
		const right = distance.rightPercent
		// 距离支撑位的距离
		const left = distance.leftPercent
		if (right > left && left > 0) {
			// 左边更近
			item.left = left + 10
			item.right = undefined
		}
		if (left > right && right > 0) {
			// 右边更近
			item.right = right + 10
			item.left = undefined
		}
		if (left < 0 && right > 0) {
			// 超出左边
			item.left = left + 10
			item.right = undefined
		}
		if (left > 0 && right < 0) {
			// 超出右边
			item.left = undefined
			item.right = right + 10
		}
	}

	const tickerHandler = (data: Ticker) => {
		setPosition()
	}

	onMounted(() => {
		// console.log('dddddd symbol.value',symbol.value)
		props.item?.symbol && $ws.addTickerHandler(props.item?.symbol, tickerHandler)
		props.item?.symbol && tickerHandler($ws.getTickers(props.item?.symbol))
	})

	onBeforeUnmount(() => {
		props.item?.symbol && $ws.removeTickerHandler(props.item?.symbol, tickerHandler)
	})
</script>
<template>
	<li @click="clickSymbol(item)">
		<div class="col-span-2 flex items-center" v-autosize="16">
			<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
			<span v-else> -- </span>
		</div>

		<div class="col-span-3 w-full text-[10px] *:rounded-sm items-center flex relative">
			<div class="h-1 w-1 absolute left-[10%] bg-red"></div>
			<div class="h-1 w-1 absolute right-[10%] bg-green"></div>
			<div
				:class="[
					'h-4 w-1/2 absolute flex items-center transition-all',
					item.left != undefined && 'breakout-down',
					item.right != undefined && 'breakout-up',
					item.right == 50 || item.left == 50 ? 'breakout-none' : '',
					item.left == undefined && item.right == undefined ? ' justify-end' : ''
				]"
				:style="[item.left != undefined ? 'left:' + Math.max(0, item.left) + '%' : '', item.right != undefined ? 'right:' + Math.max(0, item.right) + '%;justify-content:end;' : '']"
			>
				<div class="flex items-center px-1 h-full" v-autosize="10">
					<SymbolPrice :symbol="useSymbolStore().getSymbol(item.symbol)" class="!text-[10px] h-full leading-normal *:!font-normal" />
				</div>
			</div>
			<div class="h-4 breakout-bg w-full"></div>
		</div>
	</li>
</template>
<style lang="less" scoped>
	.breakout-down {
		background: linear-gradient(to right, rgb(var(--color-red) / 0.5), rgb(var(--color-red) / 0));
	}
	.breakout-up {
		background: linear-gradient(to left, rgb(var(--color-green) / 0.5), rgb(var(--color-green) / 0));
	}
	.breakout-none {
		background: transparent;
		width: 5px;
	}
	.breakout-bg {
		background: linear-gradient(to left, var(--transparent00), var(--transparent10), var(--transparent00));
	}
</style>