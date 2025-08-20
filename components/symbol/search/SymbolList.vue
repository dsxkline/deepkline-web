<script setup lang="ts">
	import ArrowDropDownOrUp from '~/components/buttons/ArrowDropDownOrUp.vue'
	import SymbolName from '~/components/symbol/SymbolName.vue'
	import SymbolPrice from '~/components/symbol/SymbolPrice.vue'
	import SymbolChangeButton from '~/components/symbol/SymbolChangeButton.vue'
	import { ref } from 'vue'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	import { publicFetch } from '~/fetch/public.fetch'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'
	import { useStore } from '~/store'
	import SymbolDetail from '../SymbolDetail.vue'
	import { usePush, useWillAppear } from '~/composable/usePush'
	import { useWillDisappear } from '~/composable/usePush'
	import type { MarketType, SymbolDto } from '~/fetch/dtos/symbol.dto'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'

	const props = defineProps<{
		symbolCategory: MarketType
		height?: number
		favorite?: boolean
		start?: boolean
		keyword?: string
		isSearchList?: boolean
		coins?: string[]
		putSymbols?: string[]
		clickHandle?: (item?: SymbolDto) => void
		selectHandle?: (item: SymbolDto) => void
	}>()
	const emit = defineEmits<{
		(event: 'clickHandle', symbol?: SymbolDto): void
	}>()
	const loading = ref(true)
	const error = ref('')
	const addouName = ref()
	const addouPrice = ref()
	const addouChange = ref()
	const lheader = ref()
	const symbols = ref<SymbolDto[]>([])
	const symbolDom = ref()
	const isLeave = ref(false)
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height ? props.height - lheader.value?.clientHeight || 0 : 0
	})
	// 虚拟化
	const scrollbar = ref<HTMLElement | null>()
	// 每个元素的高度
	let itemHeight = 56
	// 可视区域的数量
	const visibleCount = computed(() => {
		// 获取当前组件的高度
		return Math.ceil(contentHeight.value / itemHeight)
	})
	// 上下偏移量
	const offset = computed(() => Math.max(1, 2 * Math.floor(visibleCount.value)))
	// 虚拟列表的起始索引
	const start = ref(0)
	// 虚拟列表的结束索引
	const end = ref(visibleCount.value)
	// 虚拟列表
	const virtualList = computed<SymbolDto[]>(() => {
		console.log('virtualList', start.value, end.value)
		return symbols.value?.slice(start.value, end.value)
	})
	// 记录滚动位置
	const mainScrollTop = ref(0)
	// 订阅品种code列表
	const subSymbolCodes = computed(() => {
		const start = Math.max(0, offset.value)
		const end = start + visibleCount.value
		return virtualList.value.map(item => item.symbol)
	})
	// 订阅句柄
	let subHandle = ''
	// 滚动订阅限频
	let scrollTimer: any = null
	// 价格变动
	const lastPrices = ref<Record<string, number>>({})
	// 保存item
	let priceDoms: Record<string, HTMLElement> | null = {}
	// 背景动画防抖
	let flickerTimers: Record<string, any> = {}
	// 选中的品种左边的颜色线
	const activeBorderColors = ref<Record<string, string>>({})
	let scrolling = false
	// 监听滚动事件
	function scrollHandler(params: { scrollLeft: number; scrollTop: number }) {
		itemHeight = symbolDom.value?.querySelector('.symbol-list-content ul li')?.clientHeight || itemHeight
		// console.log('scrollHandler', symbolDom.value?.querySelector('ul li')?.clientHeight, itemHeight, contentHeight.value)
		scrolling = true
		mainScrollTop.value = params.scrollTop
		start.value = Math.max(0, Math.floor(params.scrollTop / itemHeight - offset.value))
		end.value =  visibleCount.value ? Math.min(start.value + visibleCount.value + 2 * offset.value, symbols.value.length) : symbols.value.length
		console.log('scrollHandler', start.value, end.value, symbols.value.length, visibleCount.value, contentHeight.value, params.scrollTop, offset.value)
		if (scrollTimer) clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			unSubSymbols()
			subSymbols()
			scrolling = false
		}, 300)
	}

	watch(
		() => useSymbolStore().favoriteSymbols,
		(n, o) => {
			props.favorite && getGroupSymbols()
		},
		{ deep: true }
	)
	watch(
		() => props.keyword,
		(val, old) => {
			getGroupSymbols()
		}
	)

	watch(
		()=>props.coins,()=>{
			getGroupSymbols()
		}
	)

	watch(
		()=>props.putSymbols,()=>{
			getGroupSymbols()
		}
	)

	function getGroupSymbols() {
		error.value = ''
		// 如果是自选，从自选中获取
		if (props.favorite) {
			symbols.value = useSymbolStore().favoriteSymbols || []
			symbols.value = symbols.value.filter(item => item.marketType === props.symbolCategory) || []
			if (props.keyword) {
				symbols.value = symbols.value.filter(item => item.symbol.toLowerCase().includes((props.keyword + '').toLowerCase()))
				filterByCoins()
			}
			if (symbols.value?.length) {
				nextTick(() => {
					scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
				})
			}
			loading.value = false
			return
		}
		if (props.putSymbols) {
			filterBySymbols()
			loading.value = false
			if (props.keyword) {
				symbols.value = symbols.value.filter(item => item.symbol.toLowerCase().includes((props.keyword + '').toLowerCase()))
			}
			console.log('props.putSymbols',symbols.value)
			if (symbols.value?.length) {
				nextTick(() => {
					scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
				})
			}
			return
		}
		// 从store中获取
		symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
		if (props.keyword) {
			symbols.value = symbols.value.filter(item => item.symbol.toLowerCase().includes((props.keyword + '').toLowerCase()))
		}
		filterByCoins()
		if (symbols.value?.length) {
			loading.value = false
			nextTick(() => {
				scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
			})
			return
		}
		loading.value = true
		// 从接口获取
		symbolsFetch
			.list(props.symbolCategory)
			.then(res => {
				loading.value = false
				if (res?.code === FetchResultDto.OK) {
					useSymbolStore().setSymbols(res.data || [])
					symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
					if (props.keyword) {
						symbols.value = symbols.value.filter(item => item.symbol.toLowerCase().includes((props.keyword + '').toLowerCase()))
						filterByCoins()
					}
					nextTick(() => {
						scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
					})
				} else {
					error.value = res?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '获取失败'
			})
	}
	function update() {
		isLeave.value = false
		// console.log('symbolCategory', props.symbolCategory, props.putSymbols)
		useSymbolStore().loadFavoriteSymbols()
		new Promise(resolve => {
			getGroupSymbols()
			resolve(null)
		})
	}

	function leave() {
		unSubSymbols()
		isLeave.value = true
	}

	function subSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (!subSymbolCodes.value?.length) return
		useSymbolStore().setSubSymbols(subSymbolCodes.value)

		subHandle = $ws.subTickers(subSymbolCodes.value, (message, error) => {
			if (scrolling) return
			if (useStore().isLeave) return
			// console.log("subTickers", message.data, error);
			if (message.data)
				message.data.forEach(item => {
					// console.log('subitem',item.instId,item)
					// 同步到store
					// useSymbolStore().setTickets(item.instId, item)
					$ws.setTickers(item.instId, item)
					activeLeftBorder(item.instId)
					// bgFlicker(item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
			lastPrices.value = {}
			priceDoms = {}
			flickerTimers = {}
			activeBorderColors.value = {}
		}
	}

	const push = usePush()

	function clickSymbol(item?: SymbolDto) {
		// 是否选中返回
		if (props.selectHandle && item) {
			props.selectHandle(item)
			return
		}
		if (useStore().isH5) {
			const params = {
				symbol: item?.symbol
				// 'onUpdate:symbol': (val:string) => {
				// 	console.log('onUpdate:symbol', val)
				// 	params.symbol = val // 或同步更新你的外部状态
				// }
			}
			push(SymbolDetail, params)
			return
		}
		item?.symbol && useSymbolStore().setActiveSymbol(item?.symbol)
		emit('clickHandle', item)
		props.clickHandle && props.clickHandle(item)
		activeLeftBorder(item?.symbol)
	}

	function activeLeftBorder(instId?: string) {
		if (!instId) return
		const { $wsb, $ws } = useNuxtApp()
		const price = $ws.getTickers(instId)?.last
		const open = $ws.getTickers(instId)?.sodUtc8
		if (activeBorderColors.value && instId) activeBorderColors.value[instId] = `${price >= open ? '!border-green-500' : '!border-red-500'}`
	}
	// let bgThrottleMap: Record<string, (...args: any[]) => void> = {}

	// function getThrottledFn(instId: string) {
	// 	if (!bgThrottleMap[instId]) {
	// 		bgThrottleMap[instId] = throttle(
	// 			(item: Ticker) => {
	// 				bgFlicker(item)
	// 			},
	// 			300,
	// 			{ trailing: false }
	// 		)
	// 	}
	// 	return bgThrottleMap[instId]
	// }

	function bgFlicker(item: Ticker) {
		if (!symbolDom.value) return

		const price = parseFloat(item.last)
		const open = parseFloat(item.sodUtc8)
		const last = lastPrices.value[item.instId] || 0

		let dom: HTMLElement | null = symbolDom.value.querySelector('#symbol-list-id-' + item.instId) as HTMLElement
		if (dom) dom = dom.querySelector('.bg') as HTMLElement

		if (dom && last) {
			// 插入前，先移除已有的 flash 背景层
			dom.classList.remove('bg-green-flash')
			dom.classList.remove('bg-red-flash')
			// 只更新 background 如果价格变化了
			if (price !== last) {
				void dom.offsetWidth // 强制 reflow
				if (price > last) {
					dom.classList.add('bg-green-flash')
				} else {
					dom.classList.add('bg-red-flash')
				}
				// const handleAnimationEnd = () => {
				// 	dom && dom.classList.remove('bg-green-flash')
				// 	dom && dom.classList.remove('bg-red-flash')
				// 	dom && dom.removeEventListener('animationend', handleAnimationEnd)
				// 	dom = null
				// }
				// dom.addEventListener('animationend', handleAnimationEnd)
			}
		}

		lastPrices.value[item.instId] = price
		dom = null
	}

	// 排序
	const symbolOrderNameHandle = (val: number) => {
		addouPrice.value.reset()
		addouChange.value.reset()
		// 根据名称排序
		getGroupSymbols()
		if (val == 1) symbols.value.sort((a, b) => a.symbol.localeCompare(b.symbol, 'en', { sensitivity: 'base' }))
		if (val == 2) symbols.value.sort((a, b) => b.symbol.localeCompare(a.symbol, 'en', { sensitivity: 'base' }))
	}
	const symbolOrderPriceHandle = (val: number) => {
		addouName.value.reset()
		addouChange.value.reset()
		const { $wsb, $ws } = useNuxtApp()
		// 根据价格排序
		getGroupSymbols()
		if (val == 1)
			symbols.value.sort((a, b) => {
				const ap = parseFloat($ws.getTickers(a.symbol)?.last || '0')
				const bp = parseFloat($ws.getTickers(b.symbol)?.last || '0')
				return ap - bp
			})

		if (val == 2)
			symbols.value.sort((a, b) => {
				const ap = parseFloat($ws.getTickers(a.symbol)?.last || '0')
				const bp = parseFloat($ws.getTickers(b.symbol)?.last || '0')
				return bp - ap
			})
	}

	const symbolOrderChangeHandle = (val: number) => {
		addouName.value.reset()
		addouPrice.value.reset()
		const { $wsb, $ws } = useNuxtApp()
		// 根据涨跌幅排序
		getGroupSymbols()
		if (val == 1)
			symbols.value.sort((a, b) => {
				const aticker = $ws.getTickers(a.symbol)
				const bticker = $ws.getTickers(b.symbol)
				const ap = aticker?.last && aticker?.sodUtc8 ? ((parseFloat(aticker?.last) - parseFloat(aticker?.sodUtc8)) / parseFloat(aticker?.sodUtc8)) * 100 : 0
				const bp = bticker?.last && aticker?.sodUtc8 ? ((parseFloat(bticker?.last) - parseFloat(bticker?.sodUtc8)) / parseFloat(bticker?.sodUtc8)) * 100 : 0
				return ap - bp
			})
		if (val == 2)
			symbols.value.sort((a, b) => {
				const aticker = $ws.getTickers(a.symbol)
				const bticker = $ws.getTickers(b.symbol)
				const ap = aticker?.last && aticker?.sodUtc8 ? ((parseFloat(aticker?.last) - parseFloat(aticker?.sodUtc8)) / parseFloat(aticker?.sodUtc8)) * 100 : 0
				const bp = bticker?.last && aticker?.sodUtc8 ? ((parseFloat(bticker?.last) - parseFloat(bticker?.sodUtc8)) / parseFloat(bticker?.sodUtc8)) * 100 : 0
				return bp - ap
			})
	}

	// 如果传了coins，根据coins过滤
	function filterByCoins() {
		if (props.coins) {
			const newSymbols: Record<string, SymbolDto> = {}
			symbols.value.forEach(symbol => {
				if (props.coins?.includes(symbol.baseCoin)) {
					newSymbols[symbol.baseCoin] = symbol
				}
			})
			// 按照coins排序
			const coinSymbols: SymbolDto[] = []
			props.coins.forEach(coin => {
				const symbol = newSymbols[coin]
				symbol && coinSymbols.push(symbol)
			})
			symbols.value = coinSymbols
			console.log('filterByCoins', props.coins, symbols.value)
		}
	}
	function filterBySymbols() {
		if (props.putSymbols) {
			// 直接传symbols进来
			const newSymbols: SymbolDto[] = []
			props.putSymbols.forEach(symbol => {
				const ns = useSymbolStore().getSymbol(symbol)
				// console.log('ns',ns)
				if (ns) newSymbols.push(ns)
			})
			symbols.value = newSymbols
			return newSymbols
		}
	}

	const whenBrowserActive = () => {
		// console.log('浏览器重新激活')
		unSubSymbols()
		subSymbols()
	}
	const { $windowEvent } = useNuxtApp()
	onUnmounted(() => {
		// bgThrottleMap = {}
		unSubSymbols()
		$windowEvent.removeEvent(whenBrowserActive)
		scrollbar.value = null
		priceDoms = null
		activeBorderColors.value = {}
		lastPrices.value = {}
		if (scrollTimer) clearTimeout(scrollTimer)
		symbols.value.forEach(symbol => flickerTimers[symbol.symbol] && clearTimeout(flickerTimers[symbol.symbol]))
		symbols.value = []
		lheader.value = null
		symbolDom.value = null
		addouName.value = null
		addouPrice.value = null
		addouChange.value = null
	})
	onMounted(() => {
		console.log('symbollist',props.start)
		if (props.start) update()
		$windowEvent.addEvent(whenBrowserActive)
	})
	useWillDisappear(() => {
		console.log('symbollist willdisappear.....')
		// 暂停订阅动画，通常用在h5页面切换事件中
		unSubSymbols()
	})
	useWillAppear(() => {
		console.log('symbollist willappear.....')
		if (isLeave.value) return
		subSymbols()
	})
	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div class="w-full h-full" ref="symbolDom">
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getGroupSymbols()">点击刷新</el-button>
			</template>
		</Error>

		<ul class="w-full" v-if="loading && !error">
			<li class="w-full h-14 grid grid-cols-4 *:flex *:items-center hover:bg-[--transparent03] px-4" v-for="item in 20">
				<el-skeleton :rows="0" animated class="col-span-2">
					<template #template>
						<el-skeleton-item variant="p" style="width: 80%; height: 30%" />
					</template>
				</el-skeleton>
				<el-skeleton :rows="0" animated class="justify-end">
					<template #template>
						<el-skeleton-item variant="p" style="width: 60%; height: 30%" />
					</template>
				</el-skeleton>
				<el-skeleton :rows="0" animated class="justify-end">
					<template #template>
						<el-skeleton-item variant="p" style="width: 60%; height: 30%" />
					</template>
				</el-skeleton>
			</li>
		</ul>
		<div ref="lheader" class="symbol-list-header w-full py-2 px-4" v-else-if="!loading && !error">
			<ul :class="'grid grid-cols-4 *:flex *:items-center text-xs text-grey' + (isSearchList ? ' grid-cols-[30px_1fr_1fr_1fr_1fr]' : '')">
				<li class="justify-start cursor-pointer select-none" v-if="isSearchList"><span></span></li>
				<li class="col-span-2 cursor-pointer select-none" @click.stop="addouName.clickHandle"><span>名称</span><ArrowDropDownOrUp @onChange="symbolOrderNameHandle" ref="addouName" /></li>
				<li class="justify-end cursor-pointer select-none pr-2" @click.stop="addouPrice.clickHandle"><span>最新价</span><ArrowDropDownOrUp @onChange="symbolOrderPriceHandle" ref="addouPrice" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouChange.clickHandle"><span>今日涨跌</span><ArrowDropDownOrUp @onChange="symbolOrderChangeHandle" ref="addouChange" /></li>
			</ul>
		</div>
		<ScrollBar class="w-full" :noScroll="!height" :style="{ height: height ? +contentHeight + 'px' : 'auto' }" @scroll="scrollHandler" ref="scrollbar" v-if="!loading && !error">
			<Empty v-if="!virtualList?.length" :style="{ height: height ? +contentHeight + 'px' : 'auto' }" />
			<!-- 容器总高度 -->
			<div :style="{ height: symbols.length * itemHeight + 'px' }" class="relative w-full symbol-list-content" v-else>
				<ul
					:class="'w-full *:relative *:w-full *:h-14 *:grid *:grid-cols-4 *:*:flex *:*:items-center *:px-4 *:cursor-pointer' + (isSearchList ? ' *:grid-cols-[30px_1fr_1fr_1fr_1fr]' : '')"
					:style="{ transform: `translateY(${start * itemHeight}px)` }"
				>
					<li
						:id="'symbol-list-id-' + item.symbol"
						:class="[
							'relative w-full h-14 grid grid-cols-4 *:flex *:items-center hover:bg-[--transparent03] px-4 cursor-pointer',
							useSymbolStore().activeSymbol == item.symbol && activeBorderColors[item.symbol] && !isSearchList ? 'border-l-2 ' + activeBorderColors[item.symbol] : ''
						]"
						v-for="item in virtualList"
						:key="item.symbol + '-' + start + '-' + end"
						@click="clickSymbol(item)"
						v-click-sound
					>
						<div class="justify-start" v-if="isSearchList"><SymbolFavoriteButton :symbol="item.symbol" /></div>
						<div class="col-span-2 text-grey flex items-center">
							<SymbolName :symbol="item" :volume="true" />
						</div>
						<div class="justify-end pr-2"><SymbolPrice :symbol="item" /></div>
						<div class="justify-end"><SymbolChangeButton :symbol="item" /></div>

						<div :class="'bg absolute top-0 left-0 w-full h-full -z-10'"></div>
					</li>
				</ul>
			</div>
		</ScrollBar>
	</div>
</template>

<style lang="less" scoped>
	@keyframes bgFlash {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.2;
		}
		100% {
			opacity: 0;
		}
	}
	:deep(ul) {
		li {
			.bg {
				opacity: 0;
			}
			// 背景闪烁
			.bg-red-flash {
				background: linear-gradient(to left, transparent, rgb(var(--color-red)));
				animation: bgFlash 0.2s ease-in-out;
			}
			.bg-green-flash {
				background: linear-gradient(to left, transparent, rgb(var(--color-green)));
				animation: bgFlash 0.2s ease-in-out;
			}
		}
	}

	@media (max-width: 999px) {
		:deep(ul) {
			li {
				border-left: none;
				&:hover {
					background-color: transparent;
				}
			}
		}
	}
</style>
