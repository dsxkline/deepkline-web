<script setup lang="ts">
	import ArrowDropDownOrUp from '~/components/buttons/ArrowDropDownOrUp.vue'
	import SymbolName from '~/components/symbol/SymbolName.vue'
	import SymbolPrice from '~/components/symbol/SymbolPrice.vue'
	import SymbolChangeButton from '~/components/symbol/SymbolChangeButton.vue'
	import { ref } from 'vue'
	import { InstanceType, type Instruments } from '~/fetch/okx/okx.type.d'
	import { publicFetch } from '~/fetch/public.fetch'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		symbolCategory: InstanceType
		height: number
	}>()
	const loading = ref(true)
	const error = ref('')
	const addouName = ref()
	const addouPrice = ref()
	const addouChange = ref()
	const lheader = ref()
	const symbols = ref<Instruments[]>([])
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height - lheader.value?.clientHeight || 0
	})
	// 虚拟化
	const scrollbar = ref<HTMLElement>()
	// 每个元素的高度
	const itemHeight = 64
	// 可视区域的数量
	const visibleCount = computed(() => {
		// 获取当前组件的高度
		return Math.ceil(contentHeight.value / itemHeight)
	})
	// 上下偏移量
	const offset = ref(Math.max(1, visibleCount.value / 2))
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

	// 监听滚动事件
	function scrollHandler(params: { scrollLeft: number; scrollTop: number }) {
		mainScrollTop.value = params.scrollTop
		offset.value = Math.max(1, Math.floor(visibleCount.value / 2))
		start.value = Math.max(0, Math.floor(params.scrollTop / itemHeight) - offset.value)
		end.value = Math.min(start.value + visibleCount.value + 2 * offset.value, symbols.value.length)
		// console.log('scrollHandler', start.value, end.value, visibleCount.value, contentHeight.value, params.scrollTop, offset.value)
		if (scrollTimer) clearTimeout(scrollTimer)
		scrollTimer = setTimeout(() => {
			unSubSymbols()
			subSymbols()
		}, 300)
	}

	function getGroupSymbols() {
		error.value = ''
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
		console.log('update')
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
					useSymbolStore().setTickets(item.instId, item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
	}
	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div class="w-full">
		<ul class="w-full" v-if="(loading && !error) || !symbols.length">
			<li class="w-full h-[64px] grid grid-cols-4 *:flex *:items-center py-3 hover:bg-[--transparent03] px-5" v-for="item in 10">
				<el-skeleton :rows="0" animated class="col-span-2">
					<template #template>
						<el-skeleton-item variant="p" style="width: 80%" />
					</template>
				</el-skeleton>
				<el-skeleton :rows="0" animated class="justify-end px-1">
					<template #template>
						<el-skeleton-item variant="p" style="width: 60%" />
					</template>
				</el-skeleton>
				<el-skeleton :rows="0" animated class="justify-end px-1">
					<template #template>
						<el-skeleton-item variant="p" style="width: 60%" />
					</template>
				</el-skeleton>
			</li>
		</ul>
		<div ref="lheader" class="w-full py-2 px-5" v-else>
			<ul class="grid grid-cols-4 *:flex *:items-center text-xs text-grey">
				<li class="col-span-2 cursor-pointer select-none" @click.stop="addouName.clickHandle"><span>名称</span><ArrowDropDownOrUp ref="addouName" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouPrice.clickHandle"><span>最新价</span><ArrowDropDownOrUp ref="addouPrice" /></li>
				<li class="justify-end cursor-pointer select-none" @click.stop="addouChange.clickHandle"><span>今日涨跌</span><ArrowDropDownOrUp ref="addouChange" /></li>
			</ul>
		</div>
		<el-scrollbar class="w-full" :style="{ height: contentHeight + 'px' }" @scroll="scrollHandler" ref="scrollbar">
			<ul class="w-full" :style="{ paddingTop: start * itemHeight + 'px', paddingBottom: (symbols?.length - 1 - end) * itemHeight + 'px' }">
				<li class="w-full h-[64px] grid grid-cols-4 *:flex *:items-center py-3 hover:bg-[--transparent03] px-5" v-for="item in virtualList" :key="item.instId + '-' + start + '-' + end">
					<div class="col-span-2"><SymbolName :symbol="item" /></div>
					<div class="justify-end px-1"><SymbolPrice :symbol="item" /></div>
					<div class="justify-end px-1"><SymbolChangeButton :symbol="item" /></div>
				</li>
			</ul>
		</el-scrollbar>
	</div>
</template>
