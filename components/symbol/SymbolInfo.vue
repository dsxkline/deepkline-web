<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import FacebookIcon from '../icons/social/FacebookIcon.vue'
	import { Link } from '@element-plus/icons-vue'

	const props = defineProps<{
		symbol: string
		height: number
	}>()
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 10000
	})
	const loading = ref(false)
	const error = ref('')
	const visibleDetail = ref(false)
	const symbolInfo = ref({
		blockBrowser: '',
		brief: '',
		classification: '',
		classificationId: '',
		currencyId: 0,
		esgUrl: '',
		facebook: '',
		flowTotal: 0,
		fullName: '',
		fullNameSeo: '',
		github: '',
		icon: '',
		introduce: '',
		introduceSeo: '',
		investor: '',
		investors: [],
		issueTime: 0,
		issueTotal: 0,
		members: [],
		newFlag: false,
		officialUrl: '',
		project: '',
		projectId: 0,
		showEsgLink: false,
		showWarningText: false,
		status: 1,
		telegram: '',
		twitter: '',
		videos: [],
		weChat: '',
		whitePaper: ''
	})
	const symbolDataInfo = ref({
		dayChangePercentage: '',
		dayHigh: 0,
		dayLow: 0,
		exchangeVol: 0,
		flowTotal: '',
		fullyDilutedMC: '',
		fullyDilutedValuation: '.0',
		highPriceDate: 0,
		high_price: 0.0,
		historyLowPrice: 0,
		historyLowPriceTime: 0,
		holdTime: 0,
		issuePrice: 0,
		issueTime: 0,
		last: 0,
		marketCap: 0,
		marketCapRank: '',
		maxFlowTotal: '',
		name: '',
		sevenDayChangePercentage: '',
		vol: 0
	})
	const symbolCoinInfo = ref({
		agency: [{ logo: '', name: '' }],
		coinAllot: [{ name: '', percent: '' }],
		hisHighPrice: 0,
		hisHighPriceTs: 0,
		hisLowPrice: 0,
		hisLowPriceTs: 0,
		hotRank: 0,
		marCapPer: 0,
		marketCapRank: 0,
		maxSup: 0,
		maxSupMar: 0,
		pubChain: [''],
		selNumPer: 0,
		supportTokenUnlock: false,
		threeMonthsReturn: 0,
		turnOver: '',
		yearReturn: 0
	})
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	watch(
		() => props.symbol,
		() => {
			if (symbolInfo.value) symbolInfo.value.project = ''
			getSymbolInfo()
		}
	)

	const getSymbolDetail = () => {
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/detail?symbol=${props.symbol.split('-')[0]}`
		console.log('getSymbolDetail', useRuntimeConfig().public.BASE_API_URL, useRuntimeConfig().public, process.env.BASE_API_URL)
		return fetch(url)
	}

	const getSymbolDataInfo = () => {
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/datainfo?symbol=${props.symbol.split('-')[0]}`
		return fetch(url)
	}

	const getSymbolCoinInfo = () => {
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/coininfo?symbol=${props.symbol.split('-')[0]}`
		return fetch(url)
	}

	const getSymbolInfo = () => {
		if (loading.value) return
		if (!symbolInfo.value?.project || error.value) {
			loading.value = true
			error.value = ''
		}

		Promise.all([getSymbolDetail(), getSymbolDataInfo(), getSymbolCoinInfo()])
			.then(responses => {
				console.log(responses)
				// 所有请求成功时
				return Promise.all(responses.map(response => response.json()))
			})
			.then(datas => {
				loading.value = false
				error.value = ''
				console.log(datas) // 这里是请求的结果数据
				const [detail, dataInfo, coinInfo] = datas
				if (!detail?.data || !dataInfo?.data || !coinInfo?.data) {
					error.value = '数据错误，请稍后再试'
				}else{
					symbolInfo.value = detail.data
					symbolDataInfo.value = dataInfo.data
					symbolCoinInfo.value = coinInfo.data
				}
			})
			.catch(err => {
				console.error('一个请求失败:', err)
				setTimeout(()=>{
					loading.value=false
					error.value = '网络异常，请稍后再试'
				},100);
				
			})
	}
	onMounted(() => {})
	const update = () => {
		getSymbolInfo()
	}

	defineExpose({
		update
	})
</script>
<template>
	<div>
		<div class="w-full h-full" v-if="!loading && !error && symbolInfo?.project">
			<el-dialog v-model="visibleDetail" :title="symbolInfo?.project + '介绍'" width="50vw" :append-to-body="true">
				<el-scrollbar height="50vh" class="px-4">
					<div class="text-sm text-main text-justify py-4" v-html="symbolInfo?.introduceSeo"></div>
				</el-scrollbar>
			</el-dialog>
			<el-scrollbar :height="contentHeight + 'px'">
				<div class="p-4 group">
					<div class="text-sm text-main flex items-center mb-3">
						<img :src="symbolInfo?.icon" alt="" class="w-6 h-6 inline-block mr-1" />
						<span class="font-bold text-[18px]">{{ symbolInfo?.project }}</span>
						<span class="mx-2 text-grey">{{ symbolInfo?.fullName }}</span>
					</div>
					<!-- <span class="text-gray-300 my-3">{{ symbolInfo?.fullName }}</span> -->
					<div class="cursor-pointer text-sm text-main my-2 mb-3 max-h-[100px] overflow-hidden line-clamp-5" v-html="symbolInfo?.introduce" @click="visibleDetail = true" click-sound></div>
					<!-- <button @click="visibleDetail = !visibleDetail" click-sound>
						<el-icon><el-icon-more /></el-icon>
					</button> -->
					<h3>基本信息</h3>
					<ul class="my-3 text-grey *:flex *:justify-between *:py-1 text-xs [&_b]:text-main [&_b]:font-normal">
						<li>
							<span>市值</span><b>${{ thousandUnit(moneyFormat(symbolDataInfo.marketCap)) }}</b>
						</li>
						<li>
							<span>流通量</span><b>{{ thousandUnit(symbolDataInfo.flowTotal) }} {{ symbolDataInfo?.name }}</b>
						</li>
						<li>
							<span>历史最高价</span><b>${{ thousandUnit(symbolDataInfo.high_price) }} ({{ formatDate(symbolDataInfo?.highPriceDate, 'YYYY/MM/DD') }})</b>
						</li>
						<li>
							<span>历史最低价</span> <b>${{ thousandUnit(symbolDataInfo.historyLowPrice) }} ({{ formatDate(symbolDataInfo?.historyLowPriceTime, 'YYYY/MM/DD') }})</b>
						</li>
						<li>
							<span>首次发行时间</span> <b>{{ formatDate(symbolDataInfo.issueTime, 'YYYY/MM/DD') }}</b>
						</li>
						<li v-if="symbolCoinInfo?.pubChain?.length">
							<span>所属公链</span> <b>{{ symbolCoinInfo?.pubChain?.join(',') }}</b>
						</li>
						<li v-if="symbolDataInfo?.issuePrice">
							<span>首次发行价</span> <b>${{ thousandUnit(symbolDataInfo.issuePrice) }}</b>
						</li>
						<li>
							<span>最大供应量</span> <b>{{ thousandUnit(symbolDataInfo.maxFlowTotal) }} {{ symbolDataInfo?.name }}</b>
						</li>
						<li>
							<span>最大供应市值</span> <b>${{ thousandUnit(moneyFormat(symbolDataInfo.fullyDilutedValuation)) }}</b>
						</li>
						<li>
							<span>流通率</span> <b>{{ thousandUnit(((parseFloat(symbolDataInfo.flowTotal) / parseFloat(symbolDataInfo.maxFlowTotal)) * 100).toFixed(2)) }}%</b>
						</li>
					</ul>
					<div class="w-full" v-if="symbolCoinInfo?.supportTokenUnlock">
						<CoinAllot :symbol="symbol" />
					</div>
					<div class="w-full">
						<h3>官方链接</h3>
						<div class="w-full my-3 text-main flex items-center flex-wrap *:mb-2 *:flex *:items-center *:justify-center text-xs *:rounded-full *:border-1 *:bg-[--transparent10] *:px-3 *:mr-2 *:py-2 [&_i]:ml-1">
							<a :href="symbolInfo?.officialUrl" target="_blank" v-if="symbolInfo?.officialUrl" class="hover:bg-[--transparent20]">
								官网 <el-icon><Link /></el-icon>
							</a>
							<a :href="symbolInfo?.github" target="_blank" v-if="symbolInfo?.github" class="hover:bg-[--transparent20]">
								Github <el-icon><Link /></el-icon>
							</a>
							<a :href="symbolInfo?.blockBrowser" target="_blank" v-if="symbolInfo?.blockBrowser" class="hover:bg-[--transparent20]">
								区块浏览器 <el-icon><Link /></el-icon>
							</a>
						</div>
					</div>

					<div class="w-full" v-if="symbolCoinInfo.agency?.length > 0">
						<h3>投资机构</h3>
						<div
							class="w-full my-3 text-main flex items-center flex-wrap *:flex *:items-center *:justify-center text-xs *:rounded-full *:border-1 *:bg-[--transparent10] *:px-3 *:mr-2 *:py-2 [&_img]:ml-1 [&_img]:w-[20px] [&_img]:rounded-full *:mb-1"
						>
							<span class="hover:bg-[--transparent20]" v-for="(item, index) in symbolCoinInfo.agency"> {{ item.name }} <img :src="item.logo" /> </span>
						</div>
					</div>

					<div class="w-full">
						<h3>社交媒体</h3>
						<div class="w-full my-3 text-grey flex items-center *:flex *:items-center *:justify-center text-xs [&_b]:text-main [&_b]:font-normal [&_svg]:w-[20px] [&_svg]:h-[20px] [&_svg]:mr-2">
							<a :href="symbolInfo?.twitter" target="_blank" v-if="symbolInfo?.twitter">
								<XIcon />
							</a>
							<a :href="symbolInfo?.telegram" target="_blank" v-if="symbolInfo?.telegram">
								<TelegramIcon />
							</a>
							<a :href="symbolInfo?.facebook" target="_blank" v-if="symbolInfo?.facebook">
								<FacebookIcon />
							</a>
						</div>
					</div>
				</div>
			</el-scrollbar>
		</div>
		<div v-else class="p-4" :style="{height:contentHeight + 'px'}">
			<Error :content="error" v-if="!loading && error">
				<button @click.stop="getSymbolInfo()">点击刷新</button>
			</Error>
			<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		</div>
	</div>
</template>
