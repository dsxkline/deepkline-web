<script setup lang="ts">
	import StopProfitLoss from '~/components/trade/StopProfitLoss.vue'
	import { usePush, usePushUp, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderType, type AddOrderDto, type AddOrderRespDto, type OrderDto } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { InstanceType, MarginMode, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useStore } from '~/store'
	import { useAccountStore } from '~/store/account'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import type { WsResult } from '~/types/types'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { useOrderStore } from '~/store/order'
	import { getAppStatusBarHeight, getFooterHeight, getHeaderHeight, getTitleBarHeight } from '~/composable/useCommon'
	import type { PositionDto } from '~/fetch/dtos/position.dto'
	const { t } = useI18n()
	const pushUp = usePushUp()
	const pushLeft = usePush()
	const props = defineProps<{
		height?: number
		symbol: string
		isH5?: boolean
		openLarverage?: boolean
		side?: Sides
		hideProfitLoss?: boolean
		price?: number
		position?: PositionDto
		action?: 'open' | 'close'
	}>()
	const emit = defineEmits<{
		(event: 'update:side', side: Sides): void
		(event: 'close'): void
	}>()
	const _action = ref<'open' | 'close'>('open')
	const loading = ref(true)
	const submitLoading = ref(false)
	const submitSide = ref(Sides.BUY)
	const error = ref('')
	const container = ref<HTMLElement>()
	const tradeContainer = ref()
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		let h = props.height
		if (process.client) {
			h = props.height || useStore().bodyHeight - getHeaderHeight() - getHeaderHeight() - getHeaderHeight() - getFooterHeight() - getAppStatusBarHeight() - getTitleBarHeight() - 10
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
				name: t('限价单'),
				value: OrderType.LIMIT
			},
			{
				name: t('市价单'),
				value: OrderType.MARKET
			}
		]
	})
	const _side = ref<Sides>(Sides.BUY)
	const ordType = ref<OrderType>(OrderType.MARKET)
	const price = ref()
	const lotSize = ref(symbolObj.value?.minSz || '')
	const canTradeLotSize = ref(0)
	const lotSizePercent = ref(0)
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
	const margin = ref('')
	const marginInput = ref<HTMLElement>()
	const buyText = computed(() => {
		return symbolObj.value?.marketType == MarketType.SPOT ? t('买入') : t('开仓')
	})
	const sellText = computed(() => {
		return symbolObj.value?.marketType == MarketType.SPOT ? t('卖出') : t('平仓')
	})
	const openStopLoss = ref(false)
	const openTakeProfit = ref(false)
	const priceInput = ref()
	const takeProfit = ref(0)
	const stopLoss = ref(0)
	const takeChangeRate = ref(0)
	const stopChangeRate = ref(0)
	const buyDes = ref('MARKET')
	const sellDes = ref('MARKET')
	const popProfit = ref()
	const popLoss = ref()
	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref<Ticker | null>($ws && $ws.getTickers(props.symbol))
	const leverage = ref(0)
	const leverages = computed(() => {
		const lv = [
			{
				label: 'x1',
				value: '1'
			},
			{
				label: 'x2',
				value: '2'
			},
			{
				label: 'x3',
				value: '3'
			},
			{
				label: 'x5',
				value: '5'
			},
			{
				label: 'x10',
				value: '10'
			},
			{
				label: 'x20',
				value: '20'
			},
			{
				label: 'x30',
				value: '30'
			},
			{
				label: 'x50',
				value: '50'
			},
			{
				label: 'x100',
				value: '100'
			}
		]
		if (orderWidth.value <= 200 && !useStore().isH5) {
			lv.unshift({
				label: t('无'),
				value: '0'
			})
		}
		return lv
	})
	const marginMode = ref<MarginMode>(MarginMode.Isolated)
	const openSelfLarverage = ref(props.openLarverage || false)
	const orderWidth = ref(0)
	const timer = ref<NodeJS.Timeout>()
	let inputing = false

	// 可用金额
	const available = computed(() => {
		// 现货买入，现货杠杆合约买入卖出都读取可用金额，因为现货杠杆可以做空卖出

		if (_action.value == 'open' && ((symbolObj.value.marketType == MarketType.SPOT && _side.value == Sides.BUY) || leverage.value)) {
			return parseFloat(useAccountStore().fund?.available || '0')
		} else {
			// 根据可卖的数量计算
			const av = canTradeLotSize.value * parseFloat(price.value || props.price || ticker.value?.last || '0') * (1 - fee.value)
			return toNumberFixed(av, '2')
		}
	})
	// 手续费
	const fee = computed(() => {
		if (symbolObj.value.marketType == MarketType.SPOT) {
			return useAccountStore().currentAccount?.config?.spotMakerFee || 0
		}
		if (symbolObj.value.marketType == MarketType.SWAP) {
			return useAccountStore().currentAccount?.config?.swapMakerFee || 0
		}
		return 0
	})

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
			_action.value = props.action || 'open'
			_side.value = Sides.BUY
			resetForm()
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
				if (ticker.value?.last) price.value = props.price || parseFloat(ticker.value?.last)
				buyDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
				sellDes.value = formatPrice(price.value, symbolObj.value?.tickSz)
			}
		}
	)

	watch(
		() => _side.value,
		(val, old) => {
			// 现货切换买卖
			if (symbolObj.value.marketType == MarketType.SPOT && leverage.value <= 0) {
				_action.value = val == 'buy' ? 'open' : 'close'
			}
			resetForm()
			emit('update:side', val)
		}
	)

	const sliderHandle = (val: number) => {
		// 滑块滑动
		// console.log('lotSizePercent', lotSizePercent)
		autoSetLotSize()
		autoSetMargin()
	}

	watch(
		() => available.value,
		() => {
			setCanTradeLotSize()
			autoSetLotSize()
			autoSetMargin()
		}
	)

	watch(
		() => leverage.value,
		() => {
			setCanTradeLotSize()
			autoSetLotSize()
			autoSetMargin()
		}
	)

	const minMargin = computed(() => {
		const last = parseFloat(ticker.value?.last || '0')
		if (!last) return 0
		const result = (parseFloat(symbolObj.value?.minSz) * (price.value || last) * (100 + fee.value)) / 100
		return parseFloat(result.toFixed(2))
	})

	const setCanTradeLotSize = () => {
		// 根据手续费以及可用金额计算可买标的数量
		// 现货买入，现货杠杆合约都进入
		if (_action.value == 'open' && ((symbolObj.value.marketType == MarketType.SPOT && _side.value == Sides.BUY) || leverage.value)) {
			const last = parseFloat(ticker.value?.last || '0')
			if (!last) return
			canTradeLotSize.value = available.value / (((price.value || last) * (100 + fee.value)) / 100)
			// 是否有杠杆
			if (leverage.value) {
				canTradeLotSize.value *= parseFloat(String(leverage.value))
			}

			if (canTradeLotSize.value < parseFloat(symbolObj.value?.minSz)) {
				canTradeLotSize.value = 0
			}
			canTradeLotSize.value = parseFloat(numberToFixed(canTradeLotSize.value, symbolObj.value?.lotSz))
		} else {
			canTradeLotSize.value = 0
			// 查询持仓可卖数量
			const position = props.position || useOrderStore().getSymbolPosition(props.symbol)
			// console.log('可平仓数量', _action.value,'leverage', leverage.value, props.position)
			if (position) {
				canTradeLotSize.value = parseFloat(numberToFixed(position.lotAvailable, symbolObj.value?.lotSz))
			}
		}
	}

	// 自动设置数量
	const autoSetLotSize = () => {
		let losz = DecimalHelper.div(DecimalHelper.mul(canTradeLotSize.value, lotSizePercent.value).toNumber(), 100).toNumber()
		if (available.value < minMargin.value && _side.value == Sides.BUY && _action.value == 'open') {
			lotSize.value = ''
		} else {
			losz = Math.max(losz, parseFloat(symbolObj.value?.minSz))
			lotSize.value = numberToFixed(losz, symbolObj.value?.lotSz)
		}
	}

	// 自动滑动滑块
	const autoScrollSlider = () => {
		// 计算百分比
		let p = DecimalHelper.div(DecimalHelper.mul(margin.value, 100).toNumber(), available.value).toNumber()
		const percent = Math.min(p, 100)
		lotSizePercent.value = percent ? percent : 0
		// console.log('autoScrollSlider', margin.value, percent)
	}

	// 自动设置保证金金额
	const autoSetMargin = () => {
		const last = parseFloat(ticker.value?.last || '0')
		if (!last) return
		// let mvalue = (parseFloat(lotSize.value) * (price.value || last) * (100 + fee.value)) / 100
		let mvalue = DecimalHelper.div(parseFloat(lotSize.value) * (price.value || last) * (100 + fee.value), 100).toNumber()
		// 有杠杆
		if (leverage.value) {
			mvalue = mvalue / parseFloat(String(leverage.value))
		}
		if (mvalue > available.value) {
			mvalue = available.value
		}
		margin.value = mvalue ? parseFloat(mvalue.toFixed(2)).toString() : ''
	}

	const marginChange = (val: string) => {
		// 只允许数字和小数点
		let clean = String(val).replace(/[^\d.]/g, '')
		// 转成 float 判断最大值
		const num = parseFloat(clean)
		if (!clean) {
			margin.value = ''
			return
		}
		margin.value = clean
		// console.log('marginChange', num, clean, val)
		nextTick(() => {
			autoScrollSlider()
			autoSetLotSize()
		})
	}

	const lotSizeChange = (val: string) => {
		// 只允许数字和小数点
		let clean = String(val).replace(/[^\d.]/g, '')
		// 转成 float 判断最大值
		const num = parseFloat(clean)
		if (!clean) {
			lotSize.value = ''
			return
		}
		lotSize.value = clean
		// console.log('lotSizeChange', num, clean, val)
		nextTick(() => {
			autoScrollSlider()
			autoSetMargin()
		})
	}

	const marginThreshold = () => {
		if (parseFloat(margin.value) > available.value) {
			margin.value = available.value.toFixed(2)
			const inputNumber = marginInput.value?.querySelector('input')
			if (inputNumber) {
				inputNumber.value = margin.value // 强制覆盖正在输入的值
			}
		}
	}
	const lotSizeThreshold = () => {
		if (parseFloat(lotSize.value) > canTradeLotSize.value) {
			lotSize.value = canTradeLotSize.value ? noExponents(canTradeLotSize.value) : ''
			const inputNumber = marginInput.value?.querySelector('input')
			if (inputNumber) {
				margin.value = available.value ? available.value.toFixed(2) : ''
				inputNumber.value = margin.value // 强制覆盖正在输入的值
			}
		}
	}

	const startTimer = () => {
		clearTimer()
		timer.value = setInterval(() => {
			setCanTradeLotSize()
			// 限制阈值
			marginThreshold()
			lotSizeThreshold()
		}, 30)
	}
	const clearTimer = () => {
		if (timer.value) clearInterval(timer.value)
	}
	const handleKeydown = (event: KeyboardEvent) => {
		// console.log('全局按键：', event.key)
		inputing = true
	}
	function handleClickOrTouch(e: Event) {
		if (lotSize.value && symbolObj.value?.minSz && DecimalHelper.compare(lotSize.value, '<=', symbolObj.value.minSz)) {
			autoSetLotSize()
			autoSetMargin()
		}

		inputing = false
	}

	function resetForm() {
		takeProfit.value = 0
		stopLoss.value = 0
		lotSize.value = symbolObj.value?.minSz
		margin.value = ''
		if(ordType.value == OrderType.MARKET) price.value = 0
		lotSizePercent.value = 0
		canChangePrice.value = true
		openTakeProfit.value = false
		openStopLoss.value = false
		autoSetMargin()
	}

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

	function confirmProfit(price: number, point: number, open: boolean, changeRate: number) {
		takeChangeRate.value = changeRate
		if (point && open) {
			takeProfit.value = price
			openTakeProfit.value = true
		} else {
			takeProfit.value = 0
			openTakeProfit.value = false
		}
		popProfit.value && popProfit.value.hide()
	}
	function confirmLoss(price: number, point: number, open: boolean, changeRate: number) {
		stopChangeRate.value = changeRate
		if (point && open) {
			stopLoss.value = price
			openStopLoss.value = true
		} else {
			stopLoss.value = 0
			openStopLoss.value = false
		}
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
				lotSize: lotSize.value,
				leverage: String(leverage.value),
				onClose: type == 0 ? confirmProfit : confirmLoss
			},
			'90%'
		)
	}

	function addOrder(s: Sides) {
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex,{},'100%')
				return
			} else {
				useNuxtApp().$dialog(LoginIndex, {}, '600px', '560px')
				return
			}
		}

		if (!useAccountStore().accounts?.length) {
			if (useStore().isH5) {
				pushLeft(ExchangeIndex)
				return
			} else {
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', t('开设账户'))
				return
			}
		}

		if (submitLoading.value) return
		submitLoading.value = true
		submitSide.value = s
		if (s == Sides.BUY && DecimalHelper.compare(available.value, '<', minMargin.value) && _action.value == 'open') {
			ElMessage.error({ message: t('可用余额不足') })
			submitLoading.value = false
			return
		}

		if (!parseFloat(lotSize.value)) {
			ElMessage.error({ message: t('请输入交易数量') })
			submitLoading.value = false
			return
		}
		if (!parseFloat(margin.value) && _action.value == 'open') {
			ElMessage.error(t('请输入交易金额'))
			submitLoading.value = false
			return
		}
		// 现货直接买卖，不需要持仓单关联，合约和杠杆需要持仓关联
		const action = _action.value
		// 现货合约杠杆平仓，平多单还是平空单
		if (props.position && action == 'close' && leverage.value > 0) {
			if (props.position.side == Sides.BUY) s = Sides.SELL
			else s = Sides.BUY
		}
		// 现货卖出，杠杆合约平仓等需要带持仓ID
		let positionId = props.position?.positionId
		if (symbolObj.value.marketType == MarketType.SPOT && leverage.value <= 0 && s == Sides.SELL) {
			positionId = useOrderStore().getSymbolPosition(props.symbol)?.positionId
		}

		const order = {
			positionId,
			action,
			side: s,
			orderType: ordType.value,
			price: String(price.value),
			lotSize: String(lotSize.value),
			marginMode: marginMode.value,
			margin: String(margin.value || '0'),
			accountId: useAccountStore().currentAccount?.accountId,
			exchange: useAccountStore().currentAccount?.exchange,
			symbol: props.symbol,
			leverage: String(leverage.value),
			takeProfitPrice: String(takeProfit.value),
			stopLossPrice: String(stopLoss.value),
			openStopLoss: openStopLoss.value,
			openTakeProfit: openTakeProfit.value
		} as AddOrderDto

		// console.log('order', order)

		orderFetch
			.add(order)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					// 下单成功,如果ws五秒内还不来就先给出提示
					resetForm()

					setTimeout(() => {
						emit('close')
						if (submitLoading.value) {
							ElMessage.success(t('下单成功'))
						}
						submitLoading.value = false
					}, 3000)
				} else {
					setTimeout(() => {
						ElMessage.error(result?.msg)
						submitLoading.value = false
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					ElMessage.error(t('网络异常，请稍后再试'))
					submitLoading.value = false
				}, 500)
			})
	}

	const wsOrderHandle = (data: WsResult<OrderDto>) => {
		// console.log('收到订单推送信息', data)
		const order = data.payload
		if (order.state == 'live') {
			// 挂单成功通知
			if (submitLoading.value) ElMessage.success('挂单成功')
			submitLoading.value = false
			emit('close')
		}

		if (order.state == 'rejected' || order.state == 'failed') {
			// 挂单失败
			const msg = order.msg || t('挂单失败')
			ElMessage.error(msg)
			submitLoading.value = false
		}
	}

	onMounted(() => {
		// console.log('tradeorder mounted', props.price, props.action)
		if (props.action) {
			_action.value = props.action
		}
		leverage.value = props.openLarverage ? 1 : 0
		price.value = props.price
		if (props.action == 'close' && props.position) {
			_side.value = props.position?.side as Sides
			leverage.value = parseInt(props.position.leverage)
		}
		setCanTradeLotSize()
		autoSetMargin()
		startTimer()
		$ws.addTickerHandler(props.symbol, tickerHandler)
		window.addEventListener('keydown', handleKeydown)
		document.addEventListener('click', handleClickOrTouch, true)
		document.addEventListener('touchstart', handleClickOrTouch, true)
		useNuxtApp().$dkws.onOrder(wsOrderHandle)
		// 监听宽度变化
		if (container.value) {
			const resizeObserver = new ResizeObserver(() => {
				orderWidth.value = container.value?.clientWidth || 0
				//console.log('container width changed', orderWidth.value)
			})
			resizeObserver.observe(container.value)
			onBeforeUnmount(() => {
				if (container.value) {
					resizeObserver.unobserve(container.value)
				}
			})
		}
	})

	useWillAppear(() => {
		startTimer()
	})

	useWillDisappear(() => {
		clearTimer()
	})

	onUnmounted(() => {
		popLoss.value = null
		popProfit.value = null
		ticker.value = null

		$ws.removeTickerHandler(props.symbol, tickerHandler)
		window.removeEventListener('keydown', handleKeydown)
		document.removeEventListener('click', handleClickOrTouch, true)
		document.removeEventListener('touchstart', handleClickOrTouch, true)
		useNuxtApp().$dkws.removeOnEvent(wsOrderHandle)
		clearTimer()
	})
</script>
<template>
	<div class="h-full w-full" ref="container">
		<div :class="['w-full h-full wrapper trade-order', isH5 ? 'trade-small' : '']">
			<client-only>
				<ScrollBar :height="isH5 ? '100%' : contentHeight + 'px'" v-show="!loading && !error">
					<div
						ref="tradeContainer"
						:class="['trade-container p-4 text-xs flex flex-col justify-between h-full', _side]"
						:style="['height:' + (isH5 ? '100%' : contentHeight + 'px')]"
						v-if="contentHeight"
					>
						<div class="pb-[200px] trade-box" v-if="!loading">
							<el-radio-group
								v-model="_side"
								class="trade-side w-full flex justify-between *:flex-1 *:!flex *:w-full"
								v-click-sound
								v-if="(!position && symbolObj?.marketType == MarketType.SPOT) || (position && !parseInt(position.leverage))"
							>
								<el-radio-button :label="buyText" :value="Sides.BUY" class="*:w-full" />
								<el-radio-button :label="sellText" :value="Sides.SELL" class="*:w-full" />
							</el-radio-group>

							<div class="flex items-center justify-between">
								<el-radio-group v-model="ordType" size="small" class="trade-type my-3 mb-3 w-full" v-click-sound>
									<el-radio-button :label="t('限价单')" :value="OrderType.LIMIT" class="*:w-full" />
									<el-radio-button :label="t('市价单')" :value="OrderType.MARKET" class="*:w-full" />
								</el-radio-group>

								<!-- <el-select v-model="leverage" class="trade-leverage-select w-full">
									<el-option v-for="item in leverages" :key="item.value" :label="item.label" :value="item.value" />
								</el-select> -->
								<div class="flex items-center justify-end larver-switch">
									<span class="text-xs text-grey text-nowrap">{{ t('杠杆') }}</span>
									<el-switch
										v-model="openSelfLarverage"
										class="ml-2"
										size="small"
										:style="`--el-switch-on-color: rgb(var(--color-${_side == Sides.BUY ? 'green' : 'red'})); --el-switch-off-color: var(--transparent10)`"
									/>
								</div>
							</div>

							<!-- 只有小屏幕显示 -->
							<div class="flex items-center justify-between margin-type-box-small" v-if="orderWidth <= 200 && !useStore().isH5">
								<Select v-model="leverage" class="!min-h-0 !p-1 gap-1 text-nowrap leverage-select">
									<template #name>
										<span class="text-grey leverage-title" v-if="!isH5">{{ t('杠杆') }}</span>
										<span class="flex-auto text-right" v-if="parseFloat(leverage)">{{ leverage }}x</span>
										<span class="flex-auto text-right text-grey" v-else-if="isH5">{{ t('杠杆') }}</span>
										<span class="flex-auto text-right !text-grey" v-else></span>
									</template>
									<div class="px-4 w-full text-center" v-if="isH5">{{ t('杠杆') }}</div>
									<SelectOption v-for="item in leverages" :key="item.value" :label="item.label" :value="item.value" class="justify-center"> </SelectOption>
								</Select>

								<el-radio-group v-model="marginMode" size="small" class="margin-type my-0 mb-2 w-full" v-click-sound v-if="parseFloat(leverage)">
									<el-radio-button :label="t('逐仓')" :value="MarginMode.Isolated" class="*:w-full" />
									<el-radio-button :label="t('全仓')" :value="MarginMode.Cross" class="*:w-full" />
								</el-radio-group>
							</div>

							<div class="flex items-center justify-between margin-type-box" v-else-if="openLarverage || (openSelfLarverage && !useStore().isH5)">
								<el-radio-group v-model="marginMode" size="small" class="margin-type w-full" v-click-sound>
									<el-radio-button :label="t('逐仓')" :value="MarginMode.Isolated" class="*:w-full" />
									<el-radio-button :label="t('全仓')" :value="MarginMode.Cross" class="*:w-full" />
								</el-radio-group>

								<!-- <el-select v-model="leverage" class="trade-leverage-select w-full">
									<el-option v-for="item in leverages" :key="item.value" :label="item.label" :value="item.value" />
								</el-select> -->

								<Select v-model="leverage" class="!min-h-0 !p-1 !px-2 gap-1 text-nowrap leverage-select">
									<template #name>
										<span class="text-grey leverage-title" v-if="!isH5">{{ t('杠杆') }}</span>
										<span class="flex-auto text-right" v-if="parseFloat(leverage)">{{ leverage }}x</span>
										<span class="flex-auto text-right text-grey" v-else-if="isH5">{{ t('杠杆') }}</span>
										<span class="flex-auto text-right !text-grey" v-else>{{ t('无') }}</span>
									</template>
									<div class="px-4 w-full text-center" v-if="isH5">{{ t('杠杆') }}</div>
									<SelectOption v-for="item in leverages.filter((it:any) => it.value != '0')" :key="item.value" :label="item.label" :value="item.value" class="justify-center"> </SelectOption>
								</Select>
							</div>

							<div class="relative price-input">
								<h5 class="pb-2">{{ t('价格') }}({{ symbolObj?.quoteCoin }})</h5>
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
							<div class="amount-container">
								<h5 class="py-2">{{ t('数量') }}({{ symbolObj?.baseCoin }})</h5>
								<el-input
									v-click-sound
									inputmode="decimal"
									v-model="lotSize"
									@input="lotSizeChange"
									:placeholder="t('最小数量') + ' ' + symbolObj?.minSz + symbolObj?.baseCoin"
									size="large"
									class="!w-full"
									:clearable="!isH5"
								/>
								<div class="slider-demo-block">
									<slider v-model="lotSizePercent" @progress="sliderHandle" :step="1" :marks="marks" :formatTooltip="formatTooltip" :hideMaskText="true" v-if="!loading" />
								</div>
							</div>

							<div class="money-container" ref="marginInput">
								<!-- 现货开仓才显示金额 -->
								<h5 class="py-2" v-if="symbolObj?.marketType == MarketType.SPOT">{{ t('金额') }}({{ symbolObj?.quoteCoin }})</h5>
								<el-input
									v-click-sound
									inputmode="decimal"
									:controls="false"
									v-model="margin"
									:max="available"
									:min="minMargin"
									:placeholder="t('请输入金额')"
									size="large"
									class="!w-full"
									:clearable="!isH5"
									@input="marginChange"
									v-if="symbolObj?.marketType == MarketType.SPOT"
								/>
								<!-- 现货 -->
								<div class="trade-av" v-if="symbolObj?.marketType == MarketType.SPOT && parseInt(position?.leverage || '0') <= 0">
									<div class="py-1 pt-2 av-item">
										<span class="text-grey">{{ _side == Sides.BUY ? t('可用') : t('可卖') }}({{ symbolObj?.quoteCoin }})</span>
										<b class="font-normal" v-if="available">{{ formatPrice(available, '2', '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
									<div class="py-1 av-item" v-if="symbolObj?.marketType == MarketType.SPOT">
										<span class="text-grey">{{ _side == Sides.BUY ? t('可买') : t('可用') }}({{ symbolObj?.baseCoin }})</span>
										<b class="font-normal" v-if="canTradeLotSize">{{ formatNumber(canTradeLotSize, symbolObj?.lotSz, '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
								</div>
							</div>

							<template v-if="!hideProfitLoss">
								<div class="pt-2 stop-container" v-if="!useStore().isH5">
									<el-popover :placement="isH5 ? 'right' : 'left'" trigger="click" ref="popProfit" :hide-after="0" width="300">
										<template #reference>
											<div v-click-sound class="bg-[--transparent02] rounded-md p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
												<h6 class="pb-2 text-grey">{{ t('止盈') }}</h6>
												<div v-if="!takeProfit">-</div>
												<div v-else class="flex flex-col text-green">
													<span>{{ numberToFixed(takeProfit, symbolObj?.tickSz) }}</span>
													<span> ≈ {{ formatNumber(takeChangeRate, '2') }}%</span>
												</div>
											</div>
										</template>
										<StopProfitLoss
											:leverage="String(leverage)"
											:type="0"
											:symbol="symbol"
											:lotSize="lotSize"
											:price="takeProfit"
											:initPrice="parseFloat(ticker?.last || '0')"
											@close="confirmProfit"
											v-if="!loading"
										/>
									</el-popover>
									<el-popover :placement="isH5 ? 'right' : 'left'" trigger="click" ref="popLoss" :hide-after="0" width="300">
										<template #reference>
											<div v-click-sound class="bg-[--transparent02] mt-1 rounded-md p-2 border border-[--transparent10] flex flex-col hover:border-[--transparent30] cursor-pointer">
												<h6 class="pb-2 text-grey">{{ t('止损') }}</h6>
												<div v-if="!stopLoss">-</div>
												<div v-else class="flex flex-col text-red">
													<span>{{ numberToFixed(stopLoss, symbolObj?.tickSz) }}</span
													><span> ≈ {{ formatNumber(stopChangeRate, '2') }}%</span>
												</div>
											</div>
										</template>
										<StopProfitLoss
											:leverage="String(leverage)"
											:type="1"
											:symbol="symbol"
											:lotSize="lotSize"
											:price="stopLoss"
											:initPrice="parseFloat(ticker?.last || '0')"
											@close="confirmLoss"
											v-if="!loading"
										/>
									</el-popover>
								</div>
								<div class="pt-2 stop-container" v-else>
									<div
										v-click-sound
										@click="pushStopProfitLoss(0)"
										class="bg-[--transparent02] mb-3 rounded-md p-2 border border-[--transparent10] flex justify-between hover:border-[--transparent30] cursor-pointer"
									>
										<h6 class="pb-0 text-grey">{{ t('止盈') }}</h6>
										<div v-if="!takeProfit">-</div>
										<div v-else class="text-green">{{ numberToFixed(takeProfit, symbolObj?.tickSz) }} ≈ {{ formatNumber(takeChangeRate, '2') }}%</div>
									</div>
									<div
										v-click-sound
										@click="pushStopProfitLoss(1)"
										class="bg-[--transparent02] mb-3 rounded-md p-2 border border-[--transparent10] flex justify-between hover:border-[--transparent30] cursor-pointer"
									>
										<h6 class="pb-0 text-grey">{{ t('止损') }}</h6>
										<div v-if="!stopLoss">-</div>
										<div v-else class="text-red">{{ numberToFixed(stopLoss, symbolObj?.tickSz) }} ≈ {{ formatNumber(stopChangeRate, '2') }}%</div>
									</div>
								</div>
							</template>
						</div>

						<div class="flex flex-col trade-bts absolute bottom-0 left-0 w-full p-3 z-10" v-if="!loading">
							<!-- 现货 -->
							<!-- 传持仓过来就是合约或者现货杠杆 -->
							<template v-if="symbolObj?.marketType == MarketType.SPOT && parseInt(position?.leverage || '0') <= 0">
								<button size="large" :class="['relative w-full !h-auto !py-3', _side == Sides.SELL ? 'bt-red' : 'bt-green']" v-click-sound @click="addOrder(_side)">
									<div class="flex flex-col items-center">
										<b class="text-base flex items-center"
											>{{ _side == Sides.BUY ? buyText : sellText }} <span class="ccy px-1">{{ symbolObj?.baseCoin }}</span> <Loading size="18px" class="ml-1" v-if="submitLoading && orderWidth > 200"
										/></b>
										<p class="pt-2">{{ buyDes }}</p>
									</div>
									<Loading class="absolute inset-0 bg-black/30" v-if="submitLoading && orderWidth <= 200 && submitSide == Sides.BUY" />
								</button>
								<button size="large" class="relative w-full !h-auto mt-3 !ml-0 bt-red !py-3 sell-bt" v-click-sound @click="addOrder(Sides.SELL)">
									<div class="flex flex-col items-center">
										<b class="text-base flex items-center"
											>{{ sellText }} <span class="ccy px-1">{{ symbolObj?.baseCoin }}</span> <Loading size="18px" class="ml-1" v-if="submitLoading && orderWidth > 200"
										/></b>
										<p class="pt-2">{{ sellDes }}</p>
									</div>
									<Loading class="absolute inset-0 bg-black/30" v-if="submitLoading && orderWidth <= 200 && submitSide == Sides.SELL" />
								</button>
							</template>
							<!-- 合约/现货杠杆 -->
							<template v-else>
								<div class="swap-cans pb-2">
									<div class="py-1 pt-2 flex justify-between items-center" v-if="!position || position?.side == Sides.BUY">
										<span class="text-grey">{{ _action == 'close' ? t('可平仓') : t('可开多') }} ({{ symbolObj?.quoteCoin }})</span>
										<b class="font-normal" v-if="available">{{ formatPrice(available, '2', '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
									<div class="py-1 flex justify-between items-center" v-if="!position || position?.side == Sides.BUY">
										<span class="text-grey">{{ t('数量') }} ({{ symbolObj?.baseCoin }})</span>
										<b class="font-normal" v-if="canTradeLotSize">{{ formatNumber(canTradeLotSize, symbolObj?.lotSz, '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
								</div>
								<button size="large" :class="['relative w-full !h-auto !py-3 bt-green']" v-click-sound @click="addOrder(_side)" v-if="!position || position?.side == Sides.BUY">
									<div class="flex flex-col items-center">
										<b class="text-base flex items-center"
											>{{ _side == Sides.BUY && !position ? t('开多') : _action == 'close' ? t('平仓') : t('平多') }} <span class="ccy px-1" v-if="_action == 'open'">{{ symbolObj?.baseCoin }}</span>
											<Loading size="18px" class="ml-1" v-if="submitLoading && orderWidth > 200 && submitSide == Sides.BUY"
										/></b>
										<p class="pt-2">{{ buyDes }}</p>
									</div>
									<Loading class="absolute inset-0 bg-black/30" v-if="submitLoading && orderWidth <= 200 && submitSide == Sides.BUY" />
								</button>
								<div class="swap-cans pt-2" v-if="!position || position?.side == Sides.SELL">
									<div class="py-1 pt-2 flex justify-between items-center">
										<span class="text-grey">可{{ _action == 'close' ? t('平仓') : t('开空') }} ({{ symbolObj?.quoteCoin }})</span>
										<b class="font-normal" v-if="available">{{ formatPrice(available, '2', '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
									<div class="py-1 flex justify-between items-center" v-if="!position || position?.side == Sides.SELL">
										<span class="text-grey">{{ t('数量') }} ({{ symbolObj?.baseCoin }})</span>
										<b class="font-normal" v-if="canTradeLotSize">{{ formatNumber(canTradeLotSize, symbolObj?.lotSz, '') }} </b>
										<b class="font-normal" v-else>--</b>
									</div>
								</div>
								<button size="large" class="relative w-full !h-auto mt-3 !ml-0 bt-red !py-3" v-click-sound @click="addOrder(Sides.SELL)" v-if="!position || position?.side == Sides.SELL">
									<div class="flex flex-col items-center">
										<b class="text-base flex items-center"
											>{{ _side == Sides.BUY ? t('开空') : _action == 'close' ? t('平仓') : t('平空') }} <span class="ccy px-1" v-if="_action == 'open'">{{ symbolObj?.baseCoin }}</span>
											<Loading size="18px" class="ml-1" v-if="submitLoading && orderWidth > 200 && submitSide == Sides.SELL"
										/></b>
										<p class="pt-2">{{ sellDes }}</p>
									</div>
									<Loading class="absolute inset-0 bg-black/30" v-if="submitLoading && orderWidth <= 200 && submitSide == Sides.SELL" />
								</button>
							</template>
						</div>
					</div>
				</ScrollBar>
			</client-only>
			<div v-show="loading" class="p-4">
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
		:deep(.slider-container) {
			--slider-border-color: rgb(var(--color-red));
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

	.leverage-title {
		display: none;
	}

	.margin-type-box {
		margin-bottom: 12px;
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

	@container (max-width: 200px) {
		.trade-order {
			.leverage-select {
				width: 100%;
				padding: 8px !important;
				margin-bottom: 8px;
				span {
					color: rgb(var(--color-text-main));
				}
				.leverage-title {
					display: unset;
				}
			}
			.trade-container {
				padding: 10px 8px;
				.trade-side {
					display: none;
				}
				.trade-type {
					display: none;
				}
				.larver-switch {
					display: none;
				}
				.margin-type-box {
					display: none;
				}
				.margin-type-box-small {
					display: flex;
					flex-direction: column;
					.margin-type {
						display: flex;
						justify-content: space-between;
						.el-radio-button,
						.el-radio-button__inner {
							width: 50%;
						}
					}
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
					padding-top: 5px;
					.av-item {
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						span {
							padding-bottom: 5px;
						}
						span:last-child {
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
						margin-right: 0;
					}

					.el-input__wrapper {
						padding: 0 5px;
						box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
						// border: 1px solid rgb(var(--color-green));
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
						padding: 0 8px;
					}
				}

				.price-input {
					:deep(.el-input-number) {
						.el-input__inner {
							font-size: 12px;
							margin-right: 18px;
						}
						.el-input__wrapper {
							// box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
							box-shadow: none;
							border: 1px solid rgb(var(--color-green));
						}
					}
				}

				.el-checkbox {
					--el-checkbox-font-size: 12px;
				}
			}
		}
	}

	@container (max-width: 999px) {
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
				.margin-type-box {
					margin-bottom: 8px;
				}
				.margin-type {
					margin: 2px 0 0 0;
					border-radius: 999px;
					background: var(--transparent05);
					width: max-content;
				}
				.leverage-select {
					border-radius: 999px;
				}
				.larverage-type {
					margin: 2px 0 8px 0;
				}
				.larver-switch {
					display: none;
				}
				.price-input {
					padding-bottom: 5px;
					:deep(.el-input-number) {
						.el-input__wrapper {
							padding-left: 40px;
							padding-right: 40px;
						}
					}
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
