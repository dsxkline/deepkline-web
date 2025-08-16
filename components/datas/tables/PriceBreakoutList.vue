<script setup lang="ts">
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { PriceSupportDto } from '~/fetch/dtos/symbol.dto'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?: boolean
		pageSize?: number
		height?: number
		source?: string
	}>()
	const loading = ref(false)
	const error = ref('')
	const datas = ref<PriceSupportDto[]>([])
	let page = 1
	let pageSize = props.pageSize || 10

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 0
	})

	function getDatas() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.support(page, pageSize)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
					setPosition()
					if (props.source == 'home') {
						// 收集订阅
						pageSubSymbols.addSubSymbols(datas.value.map(item => item.symbol))
					} else {
						unSubSymbols()
						subSymbols()
					}
				} else {
					if (!datas.value?.length) error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				if (!datas.value?.length) error.value = '网络异常，请稍后再试'
			})
	}

	function setPosition() {
		datas.value.forEach(item => {
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
		})
	}

	// 使用页面订阅收集器
	const pageSubSymbols = useAddPageSubSymbols()

	// 虚拟化
	const scrollbar = ref<HTMLElement | null>()
	let itemHeight = 40
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
	const virtualList = computed<PriceSupportDto[]>(() => {
		const s = start.value
		const e = end.value ? end.value : datas.value.length
		return datas.value?.slice(s, e)
	})
	// 记录滚动位置
	const mainScrollTop = ref(0)
	// 订阅品种code列表
	const subSymbolCodes = computed(() => {
		return virtualList.value.map(item => item.symbol)
	})
	const symbolDom = ref()
	// 订阅句柄
	let subHandle = ''
	// 滚动订阅限频
	let scrollTimer: any = null
	let scrolling = false
	// 监听滚动事件
	function scrollHandler(params: { scrollLeft: number; scrollTop: number }) {
		itemHeight = symbolDom.value?.querySelector('li')?.clientHeight || itemHeight
		// console.log('scrollHandler', symbolDom.value?.querySelector('ul li')?.clientHeight, itemHeight, contentHeight.value)
		scrolling = true
		mainScrollTop.value = params.scrollTop
		start.value = Math.max(0, Math.floor(params.scrollTop / itemHeight - offset.value))
		end.value = Math.min(start.value + visibleCount.value + 2 * offset.value, datas.value.length)
		// console.log('scrollHandler', start.value, end.value, symbols.value.length, visibleCount.value, contentHeight.value, params.scrollTop, offset.value)
		if (scrollTimer) clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			unSubSymbols()
			subSymbols()
			scrolling = false
		}, 300)
	}
	const { $wsb, $ws } = useNuxtApp()
	function subSymbols() {
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
					// bgFlicker(item)
				})
		})
	}

	function unSubSymbols() {
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
		if (props.source == 'home') {
			// 清除收集订阅
			pageSubSymbols.removeSubSymbols(datas.value.map(item => item.symbol))
		}
	}

	function update() {
		getDatas()
	}
	function leave() {
		unSubSymbols()
	}

	onBeforeUnmount(() => {
		unSubSymbols()
	})

	defineExpose({
		update,
		leave
	})
</script>
<template>
	<div class="py-2 h-full" :style="{ height: height ? +contentHeight + 'px' : '' }">
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getDatas">点击重新加载</el-button>
			</template>
		</Error>
		<Empty :msg="error" v-if="!loading && !error && !datas.length">
			<template #default>
				<el-button @click.stop="getDatas">点击重新加载</el-button>
			</template>
		</Empty>
		<ScrollBar
			class="w-full h-full"
			@scroll="scrollHandler"
			ref="scrollbar"
			:noScroll="!height"
			:style="{ height: height ? +contentHeight + 'px' : 'auto' }"
			:always="false"
			v-if="!loading && !error && datas.length"
		>
			<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between *:min-h-10 pb-6" ref="symbolDom">
				<template v-for="item in datas" :key="item.symbol">
					<TablesPriceBreakoutItem :item="item" />
				</template>
			</ul>
		</ScrollBar>
		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-else-if="loading && !error">
			<template v-for="item in pageSize">
				<div class="h-10 flex items-center">
					<el-skeleton :rows="0" animated class="col-span-2 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 70%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="col-span-3 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 100%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
			</template>
		</div>
	</div>
</template>
