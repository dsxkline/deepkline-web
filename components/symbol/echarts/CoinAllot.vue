<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	const props = defineProps({
		symbol: {
			type: String,
			default: ''
		}
	})
	const loading = ref(false)
	const error = ref('')
	const chart = ref(null)
	let echart: echarts.ECharts
	const timeVal = ref('15')
	let xAxisData: string[] = []
	let seriesData: number[] = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const maxY = ref<number>(0)

	const symbolProgressData = ref({
		ccy: '',
		dataSourceInfo: '',
		locked: '',
		maxSupply: '',
		mcap: '',
		notes: '',
		percOfLocked: '',
		percOfUnlocked: '',
		percOfUntracked: '',
		unlocked: '',
		untracked: ''
	})

	const symbolAllocationData = ref({
		ccy: '',
		list: [
			{
				label: '',
				percOfLabel: '',
				percOfUnlocked: '',
				progress: '',
				color: ''
			}
		],
		maxSupply: '',
		unlockedTs: ''
	})

	const datas = ref<{ name: string; value: number; progress: number; itemStyle?: { color: string } }[][]>([[]])
	const option = () => {
		return {
			title: {
				text: '解锁进度',
				subtext: parseFloat((parseFloat(symbolProgressData.value.percOfUnlocked) * 100).toFixed(2)) + '%',
				left: 'center',
				top: '85px',
				itemGap: 3,
				textStyle: {
					color: useColorMode().value == 'dark' ? 'white' : 'rgb(31 41 55)',
					fontWeight: 'normal',
					fontSize: 12
				},
				subtextStyle: {
					color: useColorMode().value == 'dark' ? 'white' : 'rgb(31 41 55)',
					fontSize: 12
				}
			},
			grid: {
				top: '0', // 图表容器的上边距
				bottom: '0', // 图表容器的下边距
				left: '0', // 图表容器的左边距
				right: '0' // 图表容器的右边距
			},
			legend: {
				show: false
			},
			series: datas.value.map(function (data, idx) {
				var top = 0
				return {
					type: 'pie',
					radius: [40, 70],
					center: ['50%', '100px'],
					top: '0',
					height: '100%',
					left: '0',
					width: '100%',
					itemStyle: {
						borderColor: useColorMode().value == 'dark' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)',
						borderWidth: 1
					},
					label: {
						alignTo: 'edge',
						formatter: '{name|{b}}\n{time|{c} %}',
						minMargin: 5,
						edgeDistance: 0,
						lineHeight: 20,
						rich: {
							name: {
								fontSize: 12,
								color: 'inherit'
							},
							time: {
								fontSize: 10,
								textBorderWidth:0,
								color:useColorMode().value == 'dark' ? 'white' : 'rgb(31 41 55)',
							}
						}
					},
					emphasis: {
						label: {
							rich: {
								name: {
									fontWeight: 'bold'
								},
								time: {
									fontSize: 12,
									fontWeight: 'bold'
								}
							}
						},
						labelLine: {
							lineStyle: {
								width: 2
							}
						}
					},
					labelLine: {
						length: 15,
						length2: 0,
						maxSurfaceAngle: 80
					},
					labelLayout: function (params: { labelRect: { x: number; width: any }; labelLinePoints: any }) {
						// console.log('paramssss', params)
						const isLeft = params.labelRect.x < echart.getWidth() / 2
						const points = params.labelLinePoints
						// Update the end point.
						points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width
						points.forEach((p: [x: number, y: number]) => {
							maxY.value = Math.max(maxY.value, p[1])
						})

						return {
							labelLinePoints: points
						}
					},
					data: data
				}
			})
		}
	}

	const getSymbolProgress = () => {
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/progress?symbol=${props.symbol.split('-')[0]}`
		return fetch(url)
	}

	const getSymbolAllocation = () => {
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/allocation?symbol=${props.symbol.split('-')[0]}`
		return fetch(url)
	}

	const fetchData = () => {
		if (loading.value) return
		if (!symbolProgressData.value?.ccy) {
			loading.value = true
			error.value = ''
		}

		Promise.all([getSymbolProgress(), getSymbolAllocation()])
			.then(responses => {
				console.log(responses)
				// 所有请求成功时
				return Promise.all(responses.map(response => response.json()))
			})
			.then(res => {
				loading.value = false
				error.value = ''
				console.log(res) // 这里是请求的结果数据
				const [progress, allocation] = res
				if (progress?.code === 0) {
					symbolProgressData.value = progress.data
				}
				if (allocation?.code === 0) {
					symbolAllocationData.value = allocation.data
				}

				createEchart()
			})
			.catch(error => {
				console.error('一个请求失败:', error)
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function createEchart() {
		datas.value[0] = []
		symbolAllocationData.value.list.forEach(item => {
			console.log('data item', item)
			datas.value[0].push({
				name: item.label,
				value: parseFloat((parseFloat(item.percOfLabel) * 100).toFixed(2)),
				progress: parseFloat(item.progress)
			})
		})
		const itemColor = useColorMode().value == 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
		datas.value[0].push({
			name: 'Untracked',
			value: parseFloat((parseFloat(symbolProgressData.value.percOfUntracked) * 100).toFixed(2)),
			progress: 1,
			itemStyle: { color: itemColor }
		})
		datas.value[0].push({ name: 'Locked', value: parseFloat((parseFloat(symbolProgressData.value.percOfLocked) * 100).toFixed(2)), progress: 1, itemStyle: { color: itemColor } })

		echart && echart.dispose()
		echart = echarts.init(chart.value, useColorMode().value == 'dark' ? 'dark' : 'light')
		echart.setOption(option())
		echart && echart.resize()

		const ops = echart.getOption()
		const colorPalette = ops.color as echarts.Color[]
		datas.value[0].forEach((item, index) => {
			const color = item.itemStyle?.color || colorPalette[index % colorPalette.length]
			console.log(`${item.name} 实际颜色为: ${color}`)
			if (item.itemStyle) item.itemStyle.color = color as string
			else
				item.itemStyle = {
					color: color as string
				}
		})
	}

	const dispatchAction = (index: number, type: 'highlight' | 'downplay') => {
		if (echart) {
			if (type == 'highlight') useNuxtApp().$clickSound()
			echart.dispatchAction({
				type: type,
				seriesIndex: 0,
				dataIndex: index
			})
		}
	}

	watch(
		() => props.symbol,
		val => {
			fetchData()
		}
	)
	watch(
		() => useColorMode().value,
		() => {
			createEchart()
		}
	)

	onMounted(() => {
		fetchData()
		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					// 获取父级的宽度和内边距paddingLeft
					const parentWidth = (parentElement.parentNode?.parentNode as HTMLElement).clientWidth
					const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left
					width.value = parentWidth - 2 * Math.abs(parentPaddingLeft)
					echart && echart.resize()
				}
			})
			// 监听父级元素宽度变化
			const parentElement = containerRef.value as HTMLElement
			if (parentElement) {
				resizeObserver.observe(parentElement.parentNode?.parentNode as HTMLElement)
			}
		}
	})
	onDeactivated(() => {
		echart.dispose()
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
	})
</script>
<template>
	<div class="w-full h-full my-4 pb-3" ref="containerRef">
		<div class="flex items-center justify-between mb-2">
			<h3 class="mb-1 flex items-center">代币解锁</h3>
		</div>
		<div class="container min-h-[260px] relative" v-show="!loading && !error">
			<div class="chart w-full h-full absolute top-0 left-0 overflow-hidden" :style="'height:' + (maxY + 50) + 'px'" ref="chart"></div>
			<div :style="'height:' + maxY + 'px'"></div>
			<ul class="w-full mt-7">
				<li class="flex items-center justify-between mb-2 text-xs w-full text-grey">
					<div class="w-[40%]">代币配置</div>
					<div class="w-[40px]">总量</div>
					<div class="w-[40px]">已解锁</div>
					<div class="w-[80px] text-right">进度</div>
				</li>
				<li
					v-for="(item, index) in datas[0]"
					class="flex items-center justify-between mb-2 text-[10px] hover:bg-[--transparent20] w-full"
					@mouseover="dispatchAction(index, 'highlight')"
					@mouseleave="dispatchAction(index, 'downplay')"
				>
					<div class="flex items-center w-[40%]">
						<i class="w-[10px] h-[10px] rounded-sm flex mr-1" :style="{ background: item.itemStyle?.color }"></i><span class="text-main truncate" :title="item?.name">{{ item.name }}</span>
					</div>
					<span class="w-[40px]">{{ parseFloat(item.value.toFixed(2)) }}%</span>
					<span class="w-[40px]">{{ parseFloat((item.progress * 100).toFixed(2)) }}%</span>
					<div class="flex justify-between items-center">
						<div class="w-[80px]"><el-progress :percentage="parseFloat((item.progress * 100).toFixed(2))" :show-text="false" :color="item.itemStyle?.color" /></div>
					</div>
				</li>
			</ul>
		</div>
		<el-skeleton :rows="5" animated v-if="loading && !error" />
		<Error :content="error" v-if="!loading && error">
			<el-button type="primary" @click.stop="fetchData()">点击刷新</el-button>
		</Error>
	</div>
</template>
<style lang="less" scoped></style>
