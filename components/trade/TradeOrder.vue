<script setup lang="ts">
	import { OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		height?: number
		symbol: string
	}>()
	const loading = ref(true)
	const error = ref('')
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || window?.innerHeight - 40 - 40
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
	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref($ws && $ws.getTickers(props.symbol))
	const tickerHandler = (data: Ticker) => {
		ticker.value = data
		if (canChangePrice.value) price.value = parseFloat(data.last)
	}

	watch(
		() => props.symbol,
		(val, old) => {
			price.value = 0
			canChangePrice.value = true
			$ws.removeTickerHandler(props.symbol, tickerHandler)
			$ws.addTickerHandler(props.symbol, tickerHandler)
		}
	)

	onMounted(() => {
		$ws.addTickerHandler(props.symbol, tickerHandler)
	})

	onUnmounted(() => {
		$ws.removeTickerHandler(props.symbol, tickerHandler)
	})

	const side = ref<Sides>(Sides.BUY)
	const ordType = ref<OrderType>(OrderType.LIMIT)
	const price = ref(0)
	const sz = ref()
	const szPercent = ref(0)
	const marks = reactive<Record<number, any>>({
		0: '0%',
		25: '25%',
		50: '50%',
		75: '75%',
		100: '100%'
	})
	const formatTooltip = function (value: number) {
		return value + '%'
	}
	const canChangePrice = ref(true)
	const money = ref()
	function getTradeorders() {}

	function priceChange() {
		canChangePrice.value = false
	}
	function priceFocus() {
		canChangePrice.value = false
	}
</script>
<template>
	<div>
		<div class="w-full h-full wrapper trade-order">
			<el-scrollbar :height="contentHeight + 'px'">
				<div :class="['trade-container p-4 text-xs', side]">
					<el-radio-group v-model="side" class="trade-side w-full flex justify-between *:flex-1 *:!flex *:w-full">
						<el-radio-button label="买入" value="buy" class="*:w-full" />
						<el-radio-button label="卖出" value="sell" class="*:w-full" />
					</el-radio-group>

					<el-radio-group v-model="ordType" size="small" class="trade-type mt-3 w-full">
						<el-radio-button label="限价单" :value="OrderType.LIMIT" class="*:w-full" />
						<el-radio-button label="市价单" :value="OrderType.MARKET" class="*:w-full" />
					</el-radio-group>

					<div class="py-3">
						<h5 class="py-2">价格({{ symbolObj?.quoteCcy }})</h5>
						<el-input-number
							@change="priceChange"
							@focus="priceFocus"
							v-model="price"
							:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
							:precision="point"
							controls-position="right"
							size="large"
							class="!w-full"
						/>
					</div>
					<div class="py-3">
						<h5 class="py-2">数量({{ symbolObj?.baseCcy }})</h5>
						<el-input v-model="sz" :placeholder="'最小数量 ' + symbolObj?.lotSz + symbolObj?.baseCcy" clearable size="large" class="w-full" />
						<div class="slider-demo-block">
							<el-slider v-model="szPercent" :step="1" :marks="marks" :formatTooltip="formatTooltip" />
						</div>
					</div>

					<div class="py-3">
						<h5 class="py-2">金额({{ symbolObj?.quoteCcy }})</h5>
						<el-input v-model="money" :placeholder="''" clearable size="large" class="w-full" />
						<div class="trade-av">
							<div class="py-1 pt-2">
								<span class="text-grey">可用</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
							</div>
							<div class="py-1">
								<span class="text-grey">可买</span><b class="px-1">--</b><span>{{ symbolObj?.quoteCcy }}</span>
							</div>
						</div>
					</div>

					<el-select v-model="ordType" class="trade-ordtype-select w-full my-3">
							<el-option v-for="item in ordTypeOptions" :key="item.value" :label="item.name" :value="item.value" />
						</el-select>

					<div class="flex flex-col">
						
						<el-button type="primary" size="large" class="w-full">{{ side == Sides.BUY ? '买入' : '卖出' }}</el-button>
						<el-button type="primary" size="large" class="w-full mt-3 !ml-0 sell-bt bg-red">{{ '卖出' }}</el-button>
					</div>
				</div>
			</el-scrollbar>
		</div>
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button @click.stop="getTradeorders()">点击刷新</el-button>
			</template>
		</el-result>
		<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
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
		background-color: rgb(var(--color-red));
		border-color: rgb(var(--color-red));
	}
	.trade-ordtype-select {
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
				.slider-demo-block {
					display: none;
				}
				.sell-bt {
					display: block;
				}
				.trade-av {
					display: none;
				}
				.trade-ordtype-select {
					display: block;
					:deep(.el-select__wrapper) {
						padding: 4px;
						.el-select__suffix {
							// display: none;
						}
						.el-select__selected-item {
							// text-align: center;
							color: rgb(var(--color-text-main));
						}
					}
				}
				:deep(.el-input-number) {
					.el-input__inner {
						font-size: 12px;
					}

					.el-input-number__decrease {
						display: none;
					}
					.el-input-number__increase {
						display: none;
					}
					.el-input__wrapper {
						padding: 0 5px;
					}
				}
			}
		}
	}
</style>
