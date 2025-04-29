<script setup lang="ts">
	import ArrowDropDownOrUp from '~/components/buttons/ArrowDropDownOrUp.vue'
	import SymbolName from '~/components/symbol/SymbolName.vue'
	import SymbolPrice from '~/components/symbol/SymbolPrice.vue'
	import SymbolChangeButton from '~/components/symbol/SymbolChangeButton.vue'
	import { ref } from 'vue'
	import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
	import { publicFetch } from '~/fetch/public.fetch'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		symbolCategory: InstanceType
		height: number
		favorite?: boolean
		start?: boolean
		keyword?: string
		clickHandle?: (item?: Instruments) => void
	}>()
	const emit = defineEmits<{
		(event: 'clickHandle', symbol?: Instruments): void
	}>()
	const loading = ref(true)
	const error = ref('')
	const addouName = ref()
	const addouPrice = ref()
	const addouChange = ref()
	const lheader = ref()
	const symbols = ref<Instruments[]>([])
	const symbolDom = ref()
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height - lheader.value?.clientHeight || 0
	})
	// 虚拟化
	const scrollbar = ref<HTMLElement>()
	// 每个元素的高度
	const itemHeight = 54
	// 可视区域的数量
	const visibleCount = computed(() => {
		// 获取当前组件的高度
		return Math.ceil(contentHeight.value / itemHeight)
	})
	// 上下偏移量
	const offset = computed(() => Math.max(1, Math.floor(visibleCount.value)))
	// 虚拟列表的起始索引
	const start = ref(0)
	// 虚拟列表的结束索引
	const end = ref(visibleCount.value)
	// 虚拟列表
	const virtualList = computed<Instruments[]>(() => {
		// console.log('virtualList', symbols.value?.slice(start.value, end.value))
		return symbols.value?.slice(start.value, end.value)
	})
	// 记录滚动位置
	const mainScrollTop = ref(0)
	// 订阅品种code列表
	const subSymbolCodes = computed(() => virtualList.value.map(item => item.instId))
	// 订阅句柄
	let subHandle = ''
	// 滚动订阅限频
	let scrollTimer: any = null
	// 价格变动
	const lastPrices = ref<Record<string, number>>({})

	// 监听滚动事件
	function scrollHandler(params: { scrollLeft: number; scrollTop: number }) {
		mainScrollTop.value = params.scrollTop
		start.value = Math.max(0, Math.floor(params.scrollTop / itemHeight - offset.value))
		end.value = Math.min(start.value + visibleCount.value + 2 * offset.value, symbols.value.length)
		// console.log('scrollHandler', start.value, end.value, symbols.value.length, visibleCount.value, contentHeight.value, params.scrollTop, offset.value)
		if (scrollTimer) clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			unSubSymbols()
			subSymbols()
		}, 300)
	}

	watch(
		() => useSymbolStore().favoriteSymbols,
		(n, o) => {
			getGroupSymbols()
		},
		{ deep: true }
	)
	watch(
		() => props.keyword,
		(val, old) => {
			getGroupSymbols()
		}
	)

	function getGroupSymbols() {
		error.value = ''
		// 如果是自选，从自选中获取
		if (props.favorite) {
			symbols.value = useSymbolStore().favoriteSymbols || []
			symbols.value = symbols.value.filter(item => item.instType === props.symbolCategory) || []
			if (props.keyword) {
				symbols.value = symbols.value.filter(item => item.instId.toLowerCase().includes((props.keyword + '').toLowerCase()))
			}
			if (symbols.value?.length) {
				nextTick(() => {
					scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
				})
			}
			loading.value = false
			return
		}
		// 从store中获取
		symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
		if (props.keyword) {
			symbols.value = symbols.value.filter(item => item.instId.toLowerCase().includes((props.keyword + '').toLowerCase()))
		}
		if (symbols.value?.length) {
			loading.value = false
			nextTick(() => {
				scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
			})
			return
		}
		loading.value = true
		// 从接口获取
		publicFetch
			.getInstruments(props.symbolCategory)
			.then(res => {
				loading.value = false
				if (res?.code === 0) {
					useSymbolStore().setSymbols(res.data)
					symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
					if (props.keyword) {
						symbols.value = symbols.value.filter(item => item.instId.toLowerCase().includes((props.keyword + '').toLowerCase()))
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
				console.error('getInstruments', err)
			})
	}
	function update() {
		useSymbolStore().loadFavoriteSymbols()
		getGroupSymbols()
		
	}

	function leave() {
		unSubSymbols()
	}

	function subSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		useSymbolStore().setSubSymbols(subSymbolCodes.value)
		subHandle = $ws.subTickers(subSymbolCodes.value, (message, error) => {
			// console.log("subTickers", message.data, error);
			if (message.data)
				message.data.forEach(item => {
					// 同步到store
					// useSymbolStore().setTickets(item.instId, item)
					$ws.setTickers(item.instId, item)
					bgFlicker(item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
	}
	function clickSymbol(item?: Instruments) {
		item?.instId && useSymbolStore().setActiveSymbol(item?.instId)
		emit('clickHandle', item)
		props.clickHandle && props.clickHandle(item)
	}

	function bgFlicker(item: Ticker) {
		if (!symbolDom.value) return
		const price = parseFloat(item.last)
		const last = lastPrices.value[item.instId] || 0
		const dom = symbolDom.value.querySelector('#symbol-list-id-' + item.instId + ' .bg') as HTMLElement
		const transparent = useSymbolStore().activeSymbol == item.instId ? 'transparent' : 'var(--transparent10)'
		if (dom && last) {
			if (price >= last) {
				dom.style.background = 'linear-gradient(to left,' + transparent + ',rgb(var(--color-green)))'
			} else {
				dom.style.background = 'linear-gradient(to left,' + transparent + ',rgb(var(--color-red)))'
			}
			dom.style.opacity = '0.1'
			setTimeout(() => {
				dom.style.opacity = '0'
			}, 500)
		}

		lastPrices.value[item.instId] = parseFloat(item.last)
	}

	// 排序
	const symbolOrderNameHandle = (val: number) => {
		addouPrice.value.reset()
		addouChange.value.reset()
		// 根据名称排序
		getGroupSymbols()
		if (val == 1) symbols.value.sort((a, b) => a.instId.localeCompare(b.instId, 'en', { sensitivity: 'base' }))
		if (val == 2) symbols.value.sort((a, b) => b.instId.localeCompare(a.instId, 'en', { sensitivity: 'base' }))
	}
	const symbolOrderPriceHandle = (val: number) => {
		addouName.value.reset()
		addouChange.value.reset()
		const { $wsb, $ws } = useNuxtApp()
		// 根据价格排序
		getGroupSymbols()
		if (val == 1)
			symbols.value.sort((a, b) => {
				const ap = parseFloat($ws.getTickers(a.instId)?.last || '0')
				const bp = parseFloat($ws.getTickers(b.instId)?.last || '0')
				return ap - bp
			})

		if (val == 2)
			symbols.value.sort((a, b) => {
				const ap = parseFloat($ws.getTickers(a.instId)?.last || '0')
				const bp = parseFloat($ws.getTickers(b.instId)?.last || '0')
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
				const aticker = $ws.getTickers(a.instId)
				const bticker = $ws.getTickers(b.instId)
				const ap = aticker?.last && aticker?.sodUtc8 ? ((parseFloat(aticker?.last) - parseFloat(aticker?.sodUtc8)) / parseFloat(aticker?.sodUtc8)) * 100 : 0
				const bp = bticker?.last && aticker?.sodUtc8 ? ((parseFloat(bticker?.last) - parseFloat(bticker?.sodUtc8)) / parseFloat(bticker?.sodUtc8)) * 100 : 0
				return ap - bp
			})
		if (val == 2)
			symbols.value.sort((a, b) => {
				const aticker = $ws.getTickers(a.instId)
				const bticker = $ws.getTickers(b.instId)
				const ap = aticker?.last && aticker?.sodUtc8 ? ((parseFloat(aticker?.last) - parseFloat(aticker?.sodUtc8)) / parseFloat(aticker?.sodUtc8)) * 100 : 0
				const bp = bticker?.last && aticker?.sodUtc8 ? ((parseFloat(bticker?.last) - parseFloat(bticker?.sodUtc8)) / parseFloat(bticker?.sodUtc8)) * 100 : 0
				return bp - ap
			})
	}

	const whenBrowserActive = () => {
		console.log('浏览器重新激活')
		unSubSymbols()
		subSymbols()
	}
	const { $windowEvent } = useNuxtApp()
	onUnmounted(() => {
		unSubSymbols()
		$windowEvent.removeEvent(whenBrowserActive)
	})
	onMounted(() => {
		if (props.start) update()
		$windowEvent.addEvent(whenBrowserActive)
	})
	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div class="w-full h-full" ref="symbolDom">
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button @click.stop="getGroupSymbols()">点击刷新</el-button>
			</template>
		</el-result>
		<ul class="w-full" v-if="loading && !error">
			<li class="w-full h-[54px] grid grid-cols-4 *:flex *:items-center hover:bg-[--transparent03] px-4" v-for="item in 20">
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
		<div ref="lheader" class="w-full py-2 px-4" v-else-if="!loading && !error">
			<ul class="grid grid-cols-4 *:flex *:items-center text-xs text-grey">
				<li class="col-span-2 cursor-pointer select-none" @click.stop="addouName.clickHandle"><span>名称</span><ArrowDropDownOrUp @onChange="symbolOrderNameHandle" ref="addouName" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouPrice.clickHandle"><span>最新价</span><ArrowDropDownOrUp @onChange="symbolOrderPriceHandle" ref="addouPrice" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouChange.clickHandle"><span>今日涨跌</span><ArrowDropDownOrUp @onChange="symbolOrderChangeHandle" ref="addouChange" /></li>
			</ul>
		</div>
		<el-scrollbar class="w-full" :style="{ height: contentHeight + 'px' }" @scroll="scrollHandler" ref="scrollbar" v-if="!loading && !error">
			<ul class="w-full" :style="{ paddingTop: start * itemHeight + 'px', paddingBottom: (symbols?.length - end) * itemHeight + 'px' }">
				<li
					:id="'symbol-list-id-' + item.instId"
					:class="[
						'relative w-full h-[54px] grid grid-cols-4 *:flex *:items-center hover:bg-[--transparent03] px-4 cursor-pointer',
						useSymbolStore().activeSymbol == item.instId ? '!bg-[--transparent10]' : ''
					]"
					v-for="item in virtualList"
					:key="item.instId + '-' + start + '-' + end"
					@click="clickSymbol(item)"
					click-sound
				>
					<div class="col-span-2 text-grey"><SymbolName :symbol="item" /></div>
					<div class="justify-end"><SymbolPrice :symbol="item" /></div>
					<div class="justify-end"><SymbolChangeButton :symbol="item" /></div>
					<div :class="'bg absolute top-0 left-0 w-full h-full -z-10 transition-all transition-200 ease-in-out'"></div>
				</li>
			</ul>
		</el-scrollbar>
	</div>
</template>

<style lang="less" scoped>
	.bg {
		opacity: 0;
		transition: 0.5s opacity ease-in-out;
	}
	// 背景闪烁
	.bg-red {
		background: linear-gradient(to left, transparent, rgb(var(--color-green)));
	}
	.bg-green {
		background: rgb(var(--color-green));
	}
</style>
