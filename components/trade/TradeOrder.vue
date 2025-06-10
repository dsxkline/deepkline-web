<script setup lang="ts">
	import { InstanceType, OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		height?: number
		symbol: string
	}>()
	const loading = ref(true)
	const error = ref('')
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		let h = props.height
		if (process.client) {
			h = props.height || useStore().bodyHeight - 4 * 40
			nextTick(() => {
				loading.value = false
			})
		}
		return h
	})

	const symbolObj = computed(() => useSymbolStore().getActiveSymbol())
	const point = computed(() => {
		let p = String(symbolObj.value?.tickSz).split('.')
		if (p.length > 1) {
			return p[1].length
		}
		return 0
	})
	const ordTypeOptions = computed(() => {
		return [
			{
				name: '限价单',
				value: OrderType.LIMIT
			},
			{
				name: '市价单',
				value: OrderType.MARKET
			}
		]
	})
	const side = ref<Sides>(Sides.BUY)
	const ordType = ref<OrderType>(OrderType.MARKET)
	const price = ref(0)
	const sz = ref()
	const szPercent = ref(0)
	const marks = reactive<Record<number, any>>({
		0: '0%',
		// 25: '25%',
		50: '50%',
		// 75: '75%',
		100: '100%'
	})
	const formatTooltip = function (value: number) {
		return value + '%'
	}
	const canChangePrice = ref(true)
	const money = ref()
	const buyText = computed(() => {
		return symbolObj.value?.instType == InstanceType.SPOT ? '买入' : '开仓'
	})
	const sellText = computed(() => {
		return symbolObj.value?.instType == InstanceType.SPOT ? '卖出' : '平仓'
	})
	const openStopProfitLoss = ref(false)
	const takeProfit = ref()
	const stopLoss = ref()
	const buyDes = ref('MARKET')
	const sellDes = ref('MARKET')
	const popProfit = ref()
	const popLoss = ref()
	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref<Ticker|null>($ws && $ws.getTickers(props.symbol))
	const tickerHandler = (data: Ticker) => {
		ticker.value = data
		if (canChangePrice.value) {
			price.value = parseFloat(data.last)
			sz.value = symbolObj.value?.lotSz
			if (ordType.value != OrderType.MARKET) {
				buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
				sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
			}
		}
	}

	watch(
		() => props.symbol,
		(val, old) => {
			price.value = 0
			canChangePrice.value = true
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
		}
	)
	watch(
		() => ordType.value,
		(val, old) => {
			if (val == OrderType.MARKET) {
				price.value = 0
				buyDes.value = 'MARKET'
				sellDes.value = 'MARKET'
			} else {
				if(ticker.value)price.value = parseFloat(ticker.value?.last)
				buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
				sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
			}
		}
	)

	onMounted(() => {
		$ws.addTickerHandler(props.symbol, tickerHandler)
	})

	onUnmounted(() => {
		popLoss.value = null
		popProfit.value = null
		ticker.value = null
		$ws.removeTickerHandler(props.symbol, tickerHandler)
	})

	function getTradeorders() {}

	function priceChange() {
		canChangePrice.value = false
		buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
		sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
	}
	function priceFocus() {
		canChangePrice.value = false
	}

	function confirmProfit(price: number, point: number) {
		if (point > 0) takeProfit.value = price
		else takeProfit.value = 0
		popProfit.value.hide()
	}
	function confirmLoss(price: number, point: number) {
		if (point > 0) stopLoss.value = price
		else stopLoss.value = 0
		popLoss.value.hide()
	}
</script>
<template>
	<div>
		<div class="w-full h-full wrapper trade-order">
			<client-only>
				<ScrollBar :height="contentHeight + 'px'" v-show="!loading && !error">
					<div :class="['trade-container p-4 text-xs flex flex-col justify-between h-full', side]" :style="['height:' + contentHeight + 'px']" v-if="contentHeight">
						<div class="pb-[200px]" v-if="!loading">
							<el-radio-group v-model="side" class="trade-side w-full flex justify-between *:flex-1 *:!flex *:w-full" v-click-sound>
								<el-radio-button :label="buyText" value="buy" class="*:w-full" />
								<el-radio-button :label="sellText" value="sell" class="*:w-full" />
							</el-radio-group>

							<el-radio-group v-model="ordType" size="small" class="trade-type my-3 mb-5 w-full" v-click-sound>
								<el-radio-button label="限价单" :value="OrderType.LIMIT" class="*:w-full" />
								<el-radio-button label="市价单" :value="OrderType.MARKET" class="*:w-full" />
							</el-radio-group>

							<!-- <el-select v-model="ordType" class="trade-ordtype-select w-full mb-3">
							<el-option v-for="item in ordTypeOptions" :key="item.value" :label="item.name" :value="item.value" />
						</el-select> -->

							<div class="pb-3 relative price-input">
								<h5 class="pb-2">价格({{ symbolObj?.quoteCcy }})</h5>
								<el-input-number
									@change="priceChange"
									@focus="priceFocus"
									v-model="price"
									:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
									:precision="point"
									controls-position="right"
									size="large"
									class="!w-full"
									v-click-sound
									v-if="ordType != OrderType.MARKET"
								/>
								<el-input placeholder="MARKET" size="large" class="!w-full" v-click-sound @click="ordType = OrderType.LIMIT" v-else />
								<div class="flex items-center justify-center py-1 trade-ordtype-small" v-click-sound v-if="ordType != OrderType.MARKET">
									<span class="text-grey">Pending</span>
									<button class="px-1 flex items-center" @click="ordType = OrderType.MARKET">
										<el-icon><Close class=":hover:text-main" /></el-icon>
									</button>
								</div>
							</div>
							<div class="py-3">
								<h5 class="py-2">数量({{ symbolObj?.baseCcy }})</h5>
								<el-input v-click-sound v-model="sz" :placeholder="'最小数量 ' + symbolObj?.lotSz + symbolObj?.baseCcy" clearable size="large" class="w-full" />
								<div class="slider-demo-block">
									<el-slider v-model="szPercent" :step="1" :marks="marks" :formatTooltip="formatTooltip" v-if="!loading" />
								</div>
							</div>

							<div class="py-3">
								<h5 class="py-2">金额({{ symbolObj?.quoteCcy }})</h5>
								<el-input v-click-sound v-model="money" :placeholder="'请输入金额'" clearable size="large" class="w-full" />
								<div class="trade-av">
									<div class="py-1 pt-2 av-item">
										<span class="text-grey">可用</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
									</div>
									<div class="py-1 av-item">
										<span class="text-grey">可买</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
									</div>
								</div>
							</div>

							<div class="pt-2">
								<el-popover placement="left" trigger="click" ref="popProfit" :hide-after="0">
									<template #reference>
										<div v-click-sound class="bg-[--transparent02] rounded p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
											<h6 class="pb-2 text-grey">止盈</h6>
											<div v-if="!takeProfit">-</div>
											<div v-else>{{ formatPrice(takeProfit, symbolObj?.tickSz) }}</div>
										</div>
									</template>
									<StopProfitLoss :type="0" :symbol="symbol" :price="parseFloat(ticker?.last)" @onClose="confirmProfit" v-if="!loading" />
								</el-popover>
								<el-popover placement="left" trigger="click" ref="popLoss" :hide-after="0">
									<template #reference>
										<div v-click-sound class="bg-[--transparent02] mt-1 rounded p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
											<h6 class="pb-2 text-grey">止损</h6>
											<div v-if="!stopLoss">-</div>
											<div v-else>{{ formatPrice(stopLoss, symbolObj?.tickSz) }}</div>
										</div>
									</template>
									<StopProfitLoss :type="1" :symbol="symbol" :price="parseFloat(ticker?.last)" @onClose="confirmLoss" v-if="!loading" />
								</el-popover>
							</div>
						</div>

						<div class="flex flex-col trade-bts absolute bottom-0 left-0 w-full p-3 bg-base z-10" v-if="!loading">
							<button size="large" :class="['w-full !h-auto !py-3',side==Sides.SELL?'bt-red':'bt-green']" v-click-sound>
								<div class="flex flex-col items-center">
									<b class="text-base"
										>{{ side == Sides.BUY ? buyText : sellText }} <span class="ccy">{{ symbolObj?.baseCcy }}</span></b
									>
									<p class="pt-2">{{ buyDes }}</p>
								</div>
							</button>
							<button size="large" class="w-full !h-auto mt-3 !ml-0 bt-red !py-3 sell-bt" v-click-sound>
								<div class="flex flex-col items-center">
									<b class="text-base"
										>{{ sellText }} <span class="ccy">{{ symbolObj?.baseCcy }}</span></b
									>
									<p class="pt-2">{{ sellDes }}</p>
								</div>
							</button>
						</div>
					</div>
				</ScrollBar>
			</client-only>
			<div v-show="loading || error" class="p-4">
				<Error :content="error" v-if="!loading && error">
					<template #default>
						<el-button @click.stop="getSymbolInfo()">点击刷新</el-button>
					</template>
				</Error>
				<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
			</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.sell {
		.el-slider {
			--el-slider-main-bg-color: rgb(var(--color-red));
		}
		.el-button--primary {
			--el-color-primary: rgb(var(--color-red));
		}
		.el-radio-button {
			--el-radio-button-checked-bg-color: rgb(var(--color-red));
			--el-radio-button-checked-text-color: var(--el-color-white);
			--el-radio-button-checked-border-color: rgb(var(--color-red));
			--el-radio-button-disabled-checked-fill: var(--el-border-color-extra-light);
		}
	}
	.sell-bt {
		display: none;
	}
	.trade-ordtype-select {
		display: none;
	}
	.el-checkbox {
		color: rgb(var(--color-text-grey));
	}

	.trade-bts {
		button {
			p {
				display: none;
			}
		}
	}
	.trade-ordtype-small {
		display: none;
	}

	@container (max-width: 200px) {
		.trade-order {
			.trade-container {
				padding: 16px 8px;
				.trade-side {
					display: none;
				}
				.trade-type {
					display: none;
				}
				// .slider-demo-block {
				// 	display: none;
				// }
				.trade-bts {
					button {
						p {
							display: block;
						}
						font-size: 12px;
						.ccy {
							display: none;
						}
					}
				}
				.trade-ordtype-small {
					display: flex;
				}
				.sell-bt {
					display: flex;
				}
				.trade-av {
					display: none;
					padding-top: 5px;
					.av-item {
						display: flex;
						flex-direction: column;
						span {
							padding-bottom: 5px;
						}
						span:last-child {
							display: none;
						}
						&:last-child {
							display: none;
						}
					}
				}
				.trade-ordtype-select {
					display: block;
					:deep(.el-select__wrapper) {
						padding: 4px;
						border: 1px solid rgb(var(--color-green));
						.el-select__selected-item {
							// text-align: center;
							color: rgb(var(--color-green));
						}
					}
				}
				.py-3 {
					padding-top: 3px;
					padding-bottom: 3px;
				}
				:deep(.el-input-number) {
					.el-input__inner {
						font-size: 12px;
						margin-right: 18px;
					}

					.el-input__wrapper {
						padding: 0 5px;
						// box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
						box-shadow: none;
						border: 1px solid rgb(var(--color-green));
					}

					.el-input-number__increase {
						width: 20px;
					}
					.el-input-number__decrease {
						width: 20px;
					}
				}

				:deep(.el-input) {
					.el-input__inner {
						font-size: 12px;
					}

					.el-input__wrapper {
						padding: 0 5px;
					}
				}

				.price-input {
					:deep(.el-input__wrapper) {
						// box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
						box-shadow: none;
						border: 1px solid rgb(var(--color-green));
					}
				}

				.el-checkbox {
					--el-checkbox-font-size: 12px;
				}
			}
		}
	}
</style>
