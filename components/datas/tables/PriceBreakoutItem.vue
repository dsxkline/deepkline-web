<script setup lang="ts">
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	import { usePush } from '~/composable/usePush'
	import type { PriceSupportDto } from '~/fetch/dtos/symbol.dto'
	import type { Ticker } from '~/fetch/okx/okx.type'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		priceSupport: PriceSupportDto
	}>()

	const item = ref(props.priceSupport)

	// watch(
	// 	() => props.priceSupport,
	// 	(n, o) => {
	// 		o && $ws.removeTickerHandler(o.symbol, tickerHandler)
	// 		n && $ws.addTickerHandler(n.symbol, tickerHandler)
	// 		item.value = n
	// 	},
	// 	{ deep: true }
	// )

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
	function setPosition(ticker: Ticker) {
		ticker = ticker || $ws.getTickers(item.value.symbol)
		if (!ticker) return
		// 当前价
		const price = parseFloat(ticker.last)
		// 距离
		// 记录价格突破，分数是越接近越高
		const distance = distancePercent(price, item.value.support, item.value.resistance)
		// 距离压力位的距离
		const right = distance.rightPercent
		// 距离支撑位的距离
		const left = distance.leftPercent
		if (right > left && left > 0) {
			// 左边更近
			item.value.left = left + 10
			item.value.right = undefined
		}
		if (left > right && right > 0) {
			// 右边更近
			item.value.right = right + 10
			item.value.left = undefined
		}
		if (left < 0 && right > 0) {
			// 超出左边
			item.value.left = left + 10
			item.value.right = undefined
		}
		if (left > 0 && right < 0) {
			// 超出右边
			item.value.left = undefined
			item.value.right = right + 10
		}
	}

	const tickerHandler = (data: Ticker) => {
		// if (data.instId == 'ZK-USDT') console.log(data)
		setPosition(data)
	}

	onMounted(() => {
		// console.log('dddddd symbol.value',item.value?.symbol)
		item.value?.symbol && $ws.addTickerHandler(item.value?.symbol, tickerHandler)
		item.value?.symbol && tickerHandler($ws.getTickers(item.value?.symbol))
	})

	onBeforeUnmount(() => {
		item.value?.symbol && $ws.removeTickerHandler(item.value?.symbol, tickerHandler)
	})
</script>
<template>
	<li @click="clickSymbol(item)">
		<div class="col-span-2 flex items-center" v-autosize="16">
			<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
			<span v-else> -- </span>
		</div>

		<div class="col-span-3 w-full text-[10px] *:rounded-sm items-center flex relative">
			<div class="h-1 w-1 absolute left-[10%] bg-red" v-if="item.left != undefined"></div>
			<div class="h-1 w-1 absolute right-[10%] bg-green" v-if="item.right != undefined"></div>
			<div class="absolute left-[10%] pl-2 text-red" v-if="item.left != undefined">{{ item.support }}</div>
			<div class="absolute right-[10%] pr-2 text-green" v-if="item.right != undefined">{{ item.resistance }}</div>
			<div
				:class="[
					'h-4 w-1/2 absolute flex items-center',
					item.left != undefined && 'breakout-down',
					item.right != undefined && 'breakout-up',
					item.right == 50 || item.left == 50 ? 'breakout-none' : '',
					item.left == undefined && item.right == undefined ? ' justify-end' : ''
				]"
				:style="[item.left != undefined ? 'left:' + Math.max(0, item.left) + '%' : '', item.right != undefined ? 'right:' + Math.max(0, item.right) + '%;justify-content:end;' : '']"
			>
				<!-- <div class="flex items-center px-1 h-full" v-autosize="10">
					<SymbolPrice :symbol="useSymbolStore().getSymbol(item.symbol)" class="!text-[10px] h-full leading-normal *:!font-normal" />
				</div> -->
			</div>
			<div class="h-4 breakout-bg w-full"></div>
		</div>
	</li>
</template>
<style lang="less" scoped>
	.breakout-down {
		background: linear-gradient(to right, rgb(var(--color-red) / 0.3), rgb(var(--color-red) / 0));
	}
	.breakout-up {
		background: linear-gradient(to left, rgb(var(--color-green) / 0.3), rgb(var(--color-green) / 0));
	}
	.breakout-none {
		background: transparent;
		width: 5px;
	}
	.breakout-bg {
		background: linear-gradient(to left, var(--transparent00), var(--transparent10), var(--transparent00));
	}
</style>
