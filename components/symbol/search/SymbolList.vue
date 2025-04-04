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
		// console.log('virtualList', start.value, end.value)
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
		// console.log('scrollHandler', start.value, end.value, symbols.value.length,visibleCount.value, contentHeight.value, params.scrollTop, offset.value)
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

	function getGroupSymbols() {
		error.value = ''
		// 如果是自选，从自选中获取
		if (props.favorite) {
			symbols.value = useSymbolStore().favoriteSymbols || []
			symbols.value = symbols.value.filter(item => item.instType === props.symbolCategory) || []
			if (symbols.value?.length) {
				nextTick(() => {
					scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
				})
			}
			loading.value = false
			console.log('symbols', symbols.value, props.symbolCategory)
			return
		}
		// 从store中获取
		symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
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
				console.log('getInstruments', res)
				loading.value = false
				if (res?.code === 0) {
					useSymbolStore().setSymbols(res.data)
					symbols.value = useSymbolStore().getSymbolsByCategory(props.symbolCategory) || []
					nextTick(() => {
						scrollHandler({ scrollLeft: 0, scrollTop: mainScrollTop.value })
					})
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '获取失败'
				console.error('getInstruments', err)
			})
	}
	function update() {
		console.log('update', props.favorite)
		useSymbolStore().loadFavoriteSymbols()
		getGroupSymbols()
	}

	function leave() {
		console.log('leave')
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
	}

	function bgFlicker(item: Ticker) {
        if(!symbolDom.value) return
		const price = parseFloat(item.last)
		const last = lastPrices.value[item.instId] || 0
		const dom = symbolDom.value.querySelector('#symbol-list-id-' + item.instId + ' .bg') as HTMLElement
		if (dom && last) {
            if(price>=last){
                dom.style.background = "linear-gradient(to left,transparent,rgb(var(--color-green)))";
            }else{
                dom.style.background = "linear-gradient(to left,transparent,rgb(var(--color-red)))";
            }
			dom.style.opacity = '0.1'
			setTimeout(() => {
				dom.style.opacity = '0'
			}, 500)
		}

		lastPrices.value[item.instId] = parseFloat(item.last)
	}
    onUnmounted(()=>{
        unSubSymbols()
    })
	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div class="w-full" ref="symbolDom">
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
		<div ref="lheader" class="w-full py-2 px-4" v-else>
			<ul class="grid grid-cols-4 *:flex *:items-center text-xs text-grey">
				<li class="col-span-2 cursor-pointer select-none" @click.stop="addouName.clickHandle"><span>名称</span><ArrowDropDownOrUp ref="addouName" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouPrice.clickHandle"><span>最新价</span><ArrowDropDownOrUp ref="addouPrice" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouChange.clickHandle"><span>今日涨跌</span><ArrowDropDownOrUp ref="addouChange" /></li>
			</ul>
		</div>
		<el-scrollbar class="w-full" :style="{ height: contentHeight + 'px' }" @scroll="scrollHandler" ref="scrollbar">
			<ul class="w-full" :style="{ paddingTop: start * itemHeight + 'px', paddingBottom: (symbols?.length - 1 - end) * itemHeight + 'px' }">
				<li
					:id="'symbol-list-id-' + item.instId"
					:class="['relative w-full h-[54px] grid grid-cols-4 *:flex *:items-center hover:bg-[--transparent03] px-4 cursor-pointer']"
					v-for="item in virtualList"
					:key="item.instId + '-' + start + '-' + end"
					@click.stop="clickSymbol(item)"
				>
					<div class="col-span-2"><SymbolName :symbol="item" /></div>
					<div class="justify-end"><SymbolPrice :symbol="item" /></div>
					<div class="justify-end"><SymbolChangeButton :symbol="item" /></div>
					<div :class="'bg absolute top-0 left-0 w-full h-full -z-10 '"></div>
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
		background:linear-gradient(to left,transparent,rgb(var(--color-green)));
	}
	.bg-green {
		background: rgb(var(--color-green));
	}
</style>
