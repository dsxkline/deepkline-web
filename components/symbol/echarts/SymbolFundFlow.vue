<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { marketFetch } from '~/fetch/market.fetch'
	import { useStore } from '~/store'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import type { MoneyFlowDto, MoneyFlowItem } from '~/fetch/dtos/symbol.dto'
	import { getCssVariable } from '~/composable/useCommon'
	import { useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { MessageEvents } from '~/fetch/dk/dk.websocket'
	import type { WsResult } from '~/types/types'
	const props = defineProps({
		symbol: {
			type: String,
			default: ''
		}
	})
	const loading = ref(true)
	const error = ref('')
	const chart = ref(null)
	let echart: echarts.ECharts
	const disabled = ref(false)
	const conteiner = ref()
	const maxY = ref<number>(0)

	const reds = ['rgb(245 70 130)', 'rgb(246 89 144)', 'rgb(247 108 156)', 'rgb(248 126 169)']
	const green = ['rgb(45 189 133)', 'rgb(54 208 149)', 'rgb(77 213 161)', 'rgb(99 218 173)']
	const totalAmount = ref(0)
	const flowDatas = ref<any[]>([])

	const createOptions = (moneyFlow: MoneyFlowDto) => {
		totalAmount.value = moneyFlow.total.buyAmount - moneyFlow.total.sellAmount
		let datas = [
			{
				name: '超大单卖出',
				value: numberToFixed((moneyFlow.ultra?.sellRate || 0) * 100, '2'),
				itemStyle: {
					color: reds[0],
					emphasis: {
						color: reds[0]
					}
				},

				amount: moneyFlow.ultra.sellAmount
			},
			{
				name: '大单卖出',
				value: numberToFixed((moneyFlow.big?.sellRate || 0) * 100, '2'),
				itemStyle: {
					color: reds[1],
					emphasis: {
						color: reds[1]
					}
				},
				amount: moneyFlow.big.sellAmount
			},
			{
				name: '中单卖出',
				value: numberToFixed((moneyFlow.mid?.sellRate || 0) * 100, '2'),
				itemStyle: {
					color: reds[2],
					emphasis: {
						color: reds[2]
					}
				},
				amount: moneyFlow.mid.sellAmount
			},
			{
				name: '小单卖出',
				value: numberToFixed((moneyFlow.small?.sellRate || 0) * 100, '2'),
				itemStyle: {
					color: reds[3],
					emphasis: {
						color: reds[3]
					}
				},
				amount: moneyFlow.small.sellAmount
			},
			{
				name: '超大单买入',
				value: numberToFixed((moneyFlow.ultra?.buyRate || 0) * 100, '2'),
				itemStyle: {
					color: green[0],
					emphasis: {
						color: green[0]
					}
				},
				amount: moneyFlow.ultra.buyAmount
			},
			{
				name: '大单买入',
				value: numberToFixed((moneyFlow.big?.buyRate || 0) * 100, '2'),
				itemStyle: {
					color: green[1],
					emphasis: {
						color: green[1]
					}
				},
				amount: moneyFlow.big.buyAmount
			},
			{
				name: '中单买入',
				value: numberToFixed((moneyFlow.mid?.buyRate || 0) * 100, '2'),
				itemStyle: {
					color: green[2],
					emphasis: {
						color: green[2]
					}
				},
				amount: moneyFlow.mid.buyAmount
			},
			{
				name: '小单买入',
				value: numberToFixed((moneyFlow.small?.buyRate || 0) * 100, '2'),
				itemStyle: {
					color: green[3],
					emphasis: {
						color: green[3]
					}
				},
				amount: moneyFlow.small.buyAmount
			}
		]

		datas = datas.filter(item => item.value > 0)
		flowDatas.value = datas
		const option = {
			title: {
				text: (totalAmount.value >= 0 ? '流入' : '流出') + '\n\n' + moneyFormat(totalAmount.value, '', '2'),
				left: 'center',
				top: '75',
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
				show: false,
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
			series: [
				{
					type: 'pie',
					radius: [40, 70],
					center: ['50%', '100px'],
					top: '0',
					height: '100%',
					left: '0',
					width: '100%',
					itemStyle: {
						borderColor: useStore().theme == 'dark' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)',
						borderWidth: 1
					},
					label: {
						position: 'outside', // 标签显示在外部
						alignTo: 'edge',
						align: 'left', // 或 'right'，取决于你想对齐的方向
						formatter: '{name|{b}}\n{time|{c} %}',
						minMargin: 5,
						edgeDistance: 0,
						lineHeight: 20,
						rich: {
							name: {
								fontSize: 10,
								color: 'inherit'
							},
							time: {
								fontSize: 10,
								textBorderWidth: 0,
								color: useStore().theme == 'dark' ? 'white' : 'rgb(31 41 55)'
							}
						}
					},
					emphasis: {
						label: {
							rich: {
								name: {
									fontWeight: 'bold',
									fontSize: 10
								},
								time: {
									fontSize: 10,
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
						if (!echart) return
						const isLeft = params.labelRect.x < echart.getWidth() / 2
						const points = params.labelLinePoints
						// Update the end point.
						points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width

						points.forEach((p: [x: number, y: number]) => {
							maxY.value = Math.max(maxY.value, p[1] + 20, 200)
						})
						console.log('paramssss', params)
						return {
							labelLinePoints: points
						}
					},
					data: datas
				}
			]
		}
		return option
	}

	const fetchData = () => {
		error.value = ''
		loading.value = true
		symbolsFetch
			.moneyFlow(props.symbol)
			.then(res => {
				loading.value = false
				if (res?.code == 0 && res.data) {
					const data = res.data
					console.log('moneyFlow', data)
					createEchart(createOptions(data))
				} else {
					error.value = res?.msg
				}
			})
			.catch(err => {
				console.log('err', err)
				loading.value = false
				error.value = '网络异常，请稍后再试'
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

	function createEchart(option: any) {
		echart && echart.dispose()
		echart = echarts.init(chart.value, useStore().theme == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
		conteiner.value && conteiner.value.resetSize(echart)
		echart && echart.resize()
	}

	function resetSize(width: number, height: number) {
		echart && echart.resize({ width: width, height: maxY.value })
	}

	watch(
		() => props.symbol,
		(val, old) => {
			if (val && old && val != old) {
				fetchData()
				useNuxtApp().$dkws.unSubscribe(MessageEvents.MONEY_FLOW, old)
				useNuxtApp().$dkws.subscribe(MessageEvents.MONEY_FLOW, val)
			}
		}
	)

	const moneyFlowHandle = (data: WsResult<{ symbol: string; data: MoneyFlowDto }>) => {
		const d = data.payload
		if (d?.symbol==props.symbol && d?.data) {
			createEchart(createOptions(d.data))
		}
	}

	useWillAppear(() => {
		useNuxtApp().$dkws.subscribe(MessageEvents.MONEY_FLOW, props.symbol)
	})

	useWillDisappear(() => {
		useNuxtApp().$dkws.unSubscribe(MessageEvents.MONEY_FLOW, props.symbol)
	})

	onMounted(() => {
		nextTick(() => fetchData())
		useNuxtApp().$dkws.subscribe(MessageEvents.MONEY_FLOW, props.symbol)
		useNuxtApp().$dkws.onMoneyFlow(moneyFlowHandle)
	})
	onBeforeUnmount(() => {
		useNuxtApp().$dkws.unSubscribe(MessageEvents.MONEY_FLOW, props.symbol)
		useNuxtApp().$dkws.removeOnEvent(moneyFlowHandle)
	})
	onDeactivated(() => {
		echart.dispose()
	})
</script>
<template>
	<echart-container class="mt-3 border-b border-[--border-color] pb-3" ref="conteiner" :resetSize="resetSize">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b class="text-base">资金流向</b>
			</h3>
		</div>
		<div class="container min-h-[260px] relative" v-show="!loading && !error">
			<div class="chart w-full h-full absolute top-0 left-0 overflow-hidden" :style="'height:' + maxY + 'px'" ref="chart"></div>
			<div :style="'height:' + maxY + 'px'"></div>
			<ul class="w-full mt-7">
				<li class="flex items-center justify-between mb-2 text-xs w-full text-grey">
					<div class="w-[30%]">方向</div>
					<div class="text-left">成交额</div>
					<div class="w-[40px]">占比</div>
					<div class="w-[80px] text-right"></div>
				</li>
				<li
					v-if="flowDatas"
					v-for="(item, index) in flowDatas"
					class="grid grid-cols-5 items-center justify-between mb-2 text-[10px] hover:bg-[--transparent20] w-full"
					@mouseover="dispatchAction(index, 'highlight')"
					@mouseleave="dispatchAction(index, 'downplay')"
				>
					<div class="flex items-center col-span-2">
						<i class="w-[10px] h-[10px] rounded-sm flex mr-1" :style="{ background: item.itemStyle?.color }"></i><span class="text-main truncate" :title="item?.name">{{ item.name }}</span>
					</div>
					<span class="flex justify-start">{{ moneyFormat(item?.amount || '0', '', '2') }}</span>
					<span class="flex justify-start w-[40px]">{{ numberToFixed(item.value, '2') }}%</span>
					<div class="flex justify-between items-center">
						<div class="w-[80px]"><el-progress :percentage="parseFloat(item.value)" :show-text="false" :color="item.itemStyle?.color" /></div>
					</div>
				</li>
			</ul>
		</div>
		<el-skeleton :rows="5" animated v-if="loading && !error" />
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button type="primary" @click.stop="fetchData()">点击刷新</el-button>
			</template>
		</el-result>
	</echart-container>
</template>
<style lang="less" scoped></style>
