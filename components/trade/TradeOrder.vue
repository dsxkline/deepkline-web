<script setup lang="ts">
	import StopProfitLoss from '~/components/trade/StopProfitLoss.vue'
	import { usePushUp } from '~/composable/usePush'
	import { InstanceType, OrderType,MarginMode, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const pushUp = usePushUp()
	const props = defineProps<{
		height?: number
		symbol: string
		isH5?: boolean
		openLarverage?: boolean
		side?: Sides
	}>()
	const emit = defineEmits<{
		(event: 'update:side', side: Sides): void
	}>()
	const loading = ref(true)
	const error = ref('')
	const tradeContainer = ref()
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

	const symbolObj = computed(() => useSymbolStore().getSymbol(props.symbol))
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
	const side = ref<Sides>(props.side || Sides.BUY)
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
	const priceInput = ref()
	const takeProfit = ref()
	const stopLoss = ref()
	const buyDes = ref('MARKET')
	const sellDes = ref('MARKET')
	const popProfit = ref()
	const popLoss = ref()
	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref<Ticker | null>($ws && $ws.getTickers(props.symbol))
	const lotSize = ref(0)
	const lotSizes = ref([
		{
			label: '无',
			value: 0
		},
		{
			label: 'x1',
			value: 1
		},
		{
			label: 'x2',
			value: 2
		},
		{
			label: 'x3',
			value: 3
		},
		{
			label: 'x5',
			value: 5
		},
		{
			label: 'x10',
			value: 10
		},
		{
			label: 'x20',
			value: 20
		},
		{
			label: 'x30',
			value: 30
		},
		{
			label: 'x50',
			value: 50
		},
		{
			label: 'x100',
			value: 100
		}
	])
	const marginMode = ref<MarginMode>(MarginMode.Isolated)
	
	const tickerHandler = (data: Ticker) => {
		ticker.value = data
		if (canChangePrice.value) {
			price.value = parseFloat(data.last)
			// sz.value = symbolObj.value?.lotSz
			if (ordType.value != OrderType.MARKET) {
				buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
				sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
			}
		}
	}

	watch(
		() => props.symbol,
		(val, old) => {
			takeProfit.value = 0
			stopLoss.value = 0
			sz.value = undefined
			money.value = undefined
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
				if (ticker.value) price.value = parseFloat(ticker.value?.last)
				buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
				sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
			}
		}
	)

	watch(
		() => side.value,
		(val, old) => {
			console.log('side changed', val, old)
			emit('update:side', val)
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
	function changePriceType() {
		ordType.value = OrderType.LIMIT
		priceInput.value.focus()
	}
	function priceFocus() {
		canChangePrice.value = false
	}

	function confirmProfit(price: number, point: number) {
		if (point > 0) takeProfit.value = price
		else takeProfit.value = 0
		popProfit.value && popProfit.value.hide()
	}
	function confirmLoss(price: number, point: number) {
		if (point > 0) stopLoss.value = price
		else stopLoss.value = 0
		popLoss.value && popLoss.value.hide()
	}
	function pushStopProfitLoss(type: number) {
		pushUp(
			StopProfitLoss,
			{
				type: type,
				symbol: props.symbol,
				initPrice: parseFloat(ticker.value?.last || '0'),
				price: type == 0 ? takeProfit.value : stopLoss.value,
				onClose: type == 0 ? confirmProfit : confirmLoss
			},
			'90%'
		)
	}
	// ios 移动端 input需要点击两次，fix
	function handleFocusFix(e: Event) {
		console.log('handleFocusFix', e)
		nextTick(() => {
			e.target && (e.target as HTMLInputElement).focus()
		})
	}
</script>
<template>
	<div class="h-full w-full">
		<div :class="['w-full h-full wrapper trade-order', isH5 ? 'trade-small' : '']">
			<client-only>
				<ScrollBar :height="isH5 ? '100%' : contentHeight + 'px'" v-show="!loading && !error">
					<div
						ref="tradeContainer"
						:class="['trade-container p-4 text-xs flex flex-col justify-between h-full', side]"
						:style="['height:' + (isH5 ? '100%' : contentHeight + 'px')]"
						v-if="contentHeight"
					>
						<div class="pb-[200px] trade-box" v-if="!loading">
							<el-radio-group v-model="side" class="trade-side w-full flex justify-between *:flex-1 *:!flex *:w-full" v-click-sound>
								<el-radio-button :label="buyText" :value="Sides.BUY" class="*:w-full" />
								<el-radio-button :label="sellText" :value="Sides.SELL" class="*:w-full" />
							</el-radio-group>

							<div class="flex items-center justify-between">
								<el-radio-group v-model="ordType" size="small" class="trade-type my-3 mb-3 w-full" v-click-sound>
									<el-radio-button label="限价单" :value="OrderType.LIMIT" class="*:w-full" />
									<el-radio-button label="市价单" :value="OrderType.MARKET" class="*:w-full" />
								</el-radio-group>

								<!-- <el-select v-model="lotSize" class="trade-lotsize-select w-full">
									<el-option v-for="item in lotSizes" :key="item.value" :label="item.label" :value="item.value" />
								</el-select> -->

								
							</div>

							<div class="flex items-center justify-between" v-if="openLarverage">
								<el-radio-group v-model="marginMode" size="small" class="margin-type my-3 mb-3 w-full" v-click-sound>
									<el-radio-button label="逐仓" :value="MarginMode.Isolated" class="*:w-full" />
									<el-radio-button label="全仓" :value="MarginMode.Cross" class="*:w-full" />
								</el-radio-group>

								<!-- <el-select v-model="lotSize" class="trade-lotsize-select w-full">
									<el-option v-for="item in lotSizes" :key="item.value" :label="item.label" :value="item.value" />
								</el-select> -->

								<Select v-model="lotSize" class="!min-h-0 !p-1 gap-1 text-nowrap lotsize-select">
									<template #name>
										<span class="text-grey lotsize-title" v-if="!isH5">杠杆</span>
										<span class="flex-auto text-right" v-if="lotSize">{{ lotSize }}x</span>
										<span class="flex-auto text-right text-grey" v-else-if="isH5">杠杆</span>
										<span class="flex-auto text-right !text-grey" v-else>无</span>
									</template>
									<div class="px-4 w-full text-center" v-if="isH5">杠杆</div>
									<SelectOption v-for="item in lotSizes" :key="item.value" :label="item.label" :value="item.value" class="justify-center"> </SelectOption>
								</Select>
							</div>

							<div class="pb-3 relative price-input">
								<h5 class="pb-2">价格({{ symbolObj?.quoteCcy }})</h5>
								<el-input-number
									@change="priceChange"
									@focus="priceFocus"
									v-model="price"
									:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
									:precision="point"
									:controls-position="isH5 ? '' : 'right'"
									size="large"
									class="!w-full"
									v-click-sound
									v-show="ordType != OrderType.MARKET"
									ref="priceInput"
									inputmode="decimal"
								/>
								<el-input placeholder="MARKET" size="large" class="!w-full" v-click-sound @click="changePriceType" v-show="ordType == OrderType.MARKET" />
								<div class="flex items-center justify-center py-1 trade-ordtype-small" v-click-sound v-if="ordType != OrderType.MARKET">
									<span class="text-grey">Pending</span>
									<button class="px-1 flex items-center" @click="ordType = OrderType.MARKET">
										<el-icon><Close class=":hover:text-main" /></el-icon>
									</button>
								</div>
							</div>
							<div class="py-3 amount-container">
								<h5 class="py-2">数量({{ symbolObj?.baseCcy }})</h5>
								<el-input v-click-sound inputmode="decimal" v-model="sz" :placeholder="'最小数量 ' + symbolObj?.lotSz + symbolObj?.baseCcy" size="large" class="w-full" :clearable="!isH5" />
								<div class="slider-demo-block">
									<slider v-model="szPercent" :step="1" :marks="marks" :formatTooltip="formatTooltip" :hideMaskText="true" v-if="!loading" />
								</div>
							</div>

							<div class="py-3 money-container">
								<h5 class="py-2">金额({{ symbolObj?.quoteCcy }})</h5>
								<el-input v-click-sound inputmode="decimal" :controls="false" v-model="money" :placeholder="'请输入金额'" size="large" class="w-full" :clearable="!isH5" />
								<div class="trade-av">
									<div class="py-1 pt-2 av-item">
										<span class="text-grey">可用</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
									</div>
									<div class="py-1 av-item">
										<span class="text-grey">可买</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
									</div>
								</div>
							</div>

							<div class="pt-2 stop-container" v-if="!useStore().isH5">
								<el-popover :placement="isH5 ? 'right' : 'left'" trigger="click" ref="popProfit" :hide-after="0">
									<template #reference>
										<div v-click-sound class="bg-[--transparent02] rounded-md p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
											<h6 class="pb-2 text-grey">止盈</h6>
											<div v-if="!takeProfit">-</div>
											<div v-else>{{ formatPrice(takeProfit, symbolObj?.tickSz) }}</div>
										</div>
									</template>
									<StopProfitLoss :type="0" :symbol="symbol" :price="takeProfit" :initPrice="parseFloat(ticker?.last || '0')" @close="confirmProfit" v-if="!loading" />
								</el-popover>
								<el-popover :placement="isH5 ? 'right' : 'left'" trigger="click" ref="popLoss" :hide-after="0">
									<template #reference>
										<div v-click-sound class="bg-[--transparent02] mt-1 rounded-md p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
											<h6 class="pb-2 text-grey">止损</h6>
											<div v-if="!stopLoss">-</div>
											<div v-else>{{ formatPrice(stopLoss, symbolObj?.tickSz) }}</div>
										</div>
									</template>
									<StopProfitLoss :type="1" :symbol="symbol" :price="stopLoss" :initPrice="parseFloat(ticker?.last || '0')" @close="confirmLoss" v-if="!loading" />
								</el-popover>
							</div>
							<div class="pt-2 stop-container" v-else>
								<div
									v-click-sound
									@click="pushStopProfitLoss(0)"
									class="bg-[--transparent02] mb-3 rounded-md p-2 border border-[--transparent10] flex justify-between hover:border-[--transparent30] cursor-pointer"
								>
									<h6 class="pb-0 text-grey">止盈</h6>
									<div v-if="!takeProfit">-</div>
									<div v-else>{{ formatPrice(takeProfit, symbolObj?.tickSz) }}</div>
								</div>
								<div
									v-click-sound
									@click="pushStopProfitLoss(1)"
									class="bg-[--transparent02] mb-3 rounded-md p-2 border border-[--transparent10] flex justify-between hover:border-[--transparent30] cursor-pointer"
								>
									<h6 class="pb-0 text-grey">止损</h6>
									<div v-if="!stopLoss">-</div>
									<div v-else>{{ formatPrice(stopLoss, symbolObj?.tickSz) }}</div>
								</div>
							</div>
						</div>

						<div class="flex flex-col trade-bts absolute bottom-0 left-0 w-full p-3 bg-base z-10" v-if="!loading">
							<button size="large" :class="['w-full !h-auto !py-3', side == Sides.SELL ? 'bt-red' : 'bt-green']" v-click-sound>
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
		
		--el-color-primary: rgb(var(--color-red));
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
		:deep(.el-radio-button--small) {
			.el-radio-button__inner {
				padding: 6px 10px;
			}
		}
		:deep(.slider-container){
			--slider-border-color: rgb(var(--color-red));
			// .slider-progress{
			// 	background-color: rgb(var(--color-red));
			// }
			// .slider-progress-stops{
			// 	background-color: rgb(var(--color-red));
			// }
			// .slider-tooltip{
			// 	background-color: rgb(var(--color-red));
			// }
		}
	}
	.buy {
		--el-color-primary: rgb(var(--color-green));
		.el-radio-button {
			--el-radio-button-checked-bg-color: var(--el-color-primary);
			--el-radio-button-checked-text-color: var(--el-color-white);
			--el-radio-button-checked-border-color: var(--el-color-primary);
		}
		:deep(.el-radio-button--small) {
			.el-radio-button__inner {
				padding: 6px 10px;
			}
		}
		:deep(.slider-container){
			// .slider-progress{
			// 	background-color: rgb(var(--color-green));
			// }
			// .slider-progress-stops{
			// 	background-color: rgb(var(--color-green));
			// }
			// .slider-tooltip{
			// 	background-color: rgb(var(--color-green));
			// }
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

	.lotsize-title {
		display: none;
	}

	@container (max-width: 200px) {
		.trade-order {
			.lotsize-select {
				width: 100%;
				padding: 8px !important;
				margin-bottom: 8px;
				span {
					color: rgb(var(--color-text-main));
				}
				.lotsize-title {
					display: unset;
				}
			}
			.trade-container {
				padding: 16px 8px;
				.trade-side {
					display: none;
				}
				.trade-type {
					display: none;
				}
				.slider-demo-block {
					padding-top: 5px;
				}
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

	@media (max-width: 999px) {
		.trade-small {
			min-width: 210px;

			.trade-container {
				height: 100% !important;
				padding-top: 0;
				padding-bottom: 0;
				.trade-box {
					padding-bottom: 0;
				}
				.trade-side {
					border-radius: 999px;
					background: var(--transparent05);
				}
				.trade-type {
					margin: 8px 0;
					border-radius: 999px;
					width: max-content;
					background: var(--transparent05);
				}
				.margin-type{
					margin:2px 0 8px 0;
					border-radius: 999px;
					background: var(--transparent05);
					width: max-content;
				}
				.larverage-type{
					margin:2px 0 8px 0;
				}
				.price-input {
					padding-bottom: 5px;
				}
				.amount-container {
					padding: 0 0 0 0;
				}
				.money-container {
					padding: 0;
				}
				.trade-av {
					display: flex;
					flex-direction: column;
					font-size: 10px;
					.av-item {
						display: flex;
						justify-content: space-between;
						b {
							text-align: right;
							flex: auto;
						}
					}
				}
				.trade-bts {
					position: unset;
					padding: 5px 0 0 0;
					button {
						@apply !py-2 !px-3 !text-sm;
						width: 100% !important;
						border-radius: 999px;
						b,
						p {
							@apply !text-sm;
						}
					}
				}
				.stop-container {
					:deep(.el-tooltip__trigger) {
						flex-direction: row;
						justify-content: space-between;
						margin-bottom: 10px;
						h6 {
							padding-bottom: 0;
						}
					}
				}

				:deep(.el-radio-group) {
					--el-border-radius-base: 999px;
					.el-radio-button {
						&:not(.is-active) {
							.el-radio-button__inner {
								background: transparent;
							}
						}
						&.is-active {
							.el-radio-button__inner {
								color: white;
							}
						}
						.el-radio-button__inner {
							@apply py-2 px-3 text-xs;
							line-height: 1;
							border: none;
							border-radius: 999px;
						}
					}
				}
				:deep(.el-input) {
					.el-input__wrapper {
						transition: none;
						.el-input__inner {
							--el-input-inner-height: 30px;
							@apply text-xs;
						}
					}
				}
				:deep(.el-input-number) {
					&.is-controls-right[class*='large'] [class*='decrease'],
					&.is-controls-right[class*='large'] [class*='increase'] {
						--el-input-number-controls-height: 15px;
					}
				}
			}
		}
	}
</style>
