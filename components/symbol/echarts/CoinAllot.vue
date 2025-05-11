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
				progress: ''
			},
			{
				label: '',
				percOfLabel: '',
				percOfUnlocked: '',
				progress: ''
			},
			{
				label: '',
				percOfLabel: '',
				percOfUnlocked: '',
				progress: ''
			},
			{
				label: '',
				percOfLabel: '',
				percOfUnlocked: '',
				progress: ''
			}
		],
		maxSupply: '',
		unlockedTs: ''
	})

	const datas: { name: string; value: number ,itemStyle?:{color:string}}[][] = [
		////////////////////////////////////////
		[
			// { name: '团队', value: 21.51 },
			// { name: '投资者', value: 17.8 },
			// { name: '社区', value: 15.0 },
			// { name: '顾问', value: 0.69 },
			// { name: '未追踪', value: 45.0 },
			// { name: '已锁定', value: 0.0 }
		]
	]
	const option = () => {
		return {
			title: {
				text: '解锁进度',
				subtext: parseFloat((parseFloat(symbolProgressData.value.percOfUnlocked) * 100).toFixed(2)) + '%',
				left: 'center',
				top: '85px',
				itemGap: 3,
				textStyle: {
					color: 'rgb(249 250 251)',
					fontWeight: 'normal',
					fontSize: 12
				},
				subtextStyle: {
					color: 'rgb(249 250 251)',
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
				bottom: '0',
				left: '0',
				right: '0',
				itemWidth: 10,
				itemHeight: 10,
				padding: 0,
				itemStyle: {
					borderWidth: 0,
					left: 0
				},
				textStyle: {
					color: 'rgb(143 144 154)',
					fontSize: 12
				}
			},
			series: datas.map(function (data, idx) {
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
						borderColor: 'rgb(0 0 0)',
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
								color: '#fff'
							}
						}
					},
					labelLine: {
						length: 15,
						length2: 0,
						maxSurfaceAngle: 80
					},
					labelLayout: function (params: { labelRect: { x: number; width: any }; labelLinePoints: any }) {
						const isLeft = params.labelRect.x < echart.getWidth() / 2
						const points = params.labelLinePoints
						// Update the end point.
						points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width
						console.log('points',points)
						points.forEach((p:[x:number,y:number]) => {
							maxY.value = Math.max(maxY.value,p[1])
							console.log('maxY',maxY.value,p[1])
						});
						
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
				symbolAllocationData.value.list.forEach(item => {
					console.log('data item', item)
					datas[0].push({
						name: item.label,
						value: parseFloat((parseFloat(item.percOfLabel) * 100).toFixed(2))
					})
				})
				datas[0].push({ name: 'Untracked', value: parseFloat((parseFloat(symbolProgressData.value.percOfUntracked) * 100).toFixed(2)),itemStyle: { color: 'rgba(255,255,255,0.2)' }})
				datas[0].push({ name: 'Locked', value: parseFloat((parseFloat(symbolProgressData.value.percOfLocked) * 100).toFixed(2)) ,itemStyle: { color: '#f5625c' }})

				createEchart()
			})
			.catch(error => {
				console.error('一个请求失败:', error)
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function createEchart() {
		echart && echart.dispose()
		echart = echarts.init(chart.value, useColorMode().value == 'dark' ? 'dark' : 'light')
		echart.setOption(option())
		echart && echart.resize()
	}

	watch(
		()=>props.symbol,
		val=>{
			fetchData()
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
					echart.resize()
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
			<div class="chart w-full h-full absolute top-0 left-0" ref="chart"></div>
			<div :style="'height:'+maxY+'px'"></div>
			<ul class="flex flex-wrap invisible mt-3" >
				<li v-for="item in symbolAllocationData.list" class="flex items-center mr-2 mb-3">
					<i class="w-[10px] h-[10px] rounded-sm flex bg-red mr-1"></i><span class="text-xs text-grey">{{ item.label }}</span>
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
