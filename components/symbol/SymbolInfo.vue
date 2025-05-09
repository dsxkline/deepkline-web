<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import FacebookIcon from '../icons/social/FacebookIcon.vue'
	import {Link} from '@element-plus/icons-vue'

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
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	watch(()=>props.symbol,()=>{
		symbolInfo.value.project = ''
		getSymbolInfo()
	})
	const getSymbolInfo = () => {
		if (loading.value) return
		if (!symbolInfo.value?.project) {
			loading.value = true
			error.value = ''
		}
		const url = `${useRuntimeConfig().public.BASE_API_URL}/v1/symbols/detail?symbol=${props.symbol.split('-')[0]}`
		fetch(url)
			.then(res => res.json())
			.then(res => {
				loading.value = false
				if (res.code == 0) {
					console.log('symbolInfo', res.data)
					symbolInfo.value = res.data
				} else {
					error.value = res.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = err.message
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
					</div>
					<!-- <span class="text-gray-300 my-3">{{ symbolInfo?.fullName }}</span> -->
					<div class="cursor-pointer text-sm text-main mt-2 max-h-[100px] overflow-hidden text-ellipsis text-justify" v-html="symbolInfo?.introduce" @click="visibleDetail = true" click-sound></div>
					<button @click="visibleDetail = !visibleDetail" click-sound>
						<el-icon><el-icon-more /></el-icon>
					</button>

					<ul class="my-3 text-grey *:flex *:justify-between *:py-1 text-xs [&_b]:text-main [&_b]:font-normal">
						<li><span>市值</span><b>$2,040,530,686,054</b></li>
						<li>
							<span>流通量</span><b>{{ thousandUnit(symbolInfo.flowTotal) }} {{ symbolObj?.baseCcy }}</b>
						</li>
						<li><span>历史最高价</span><b>$109,800.0 (2025/01/20)</b></li>
						<li><span>历史最低价</span> <b>$67.8100 (2013/07/06)</b></li>
						<li><span>首次发行时间</span> <b>2008/10/31</b></li>
						<li><span>所属公链</span> <b>BTC</b></li>
						<li><span>首次发行价</span> <b>$0.0025000</b></li>
						<li><span>最大供应量</span> <b>21,000,000 BTC</b></li>
						<li><span>最大供应市值</span> <b>$2,157,428,700,000</b></li>
						<li><span>流通率</span> <b>94.58%</b></li>
					</ul>
					<div class="w-full ">
						<h3>官方链接</h3>
						<div class="w-full my-3 text-main flex items-center *:flex *:items-center *:justify-center text-xs *:rounded-full *:border-1 *:bg-[--transparent10] *:px-3 *:mr-2 *:py-2 [&_i]:ml-1">
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
					<div class="w-full ">
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
		<div v-else class="p-4">
			<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
				<template #extra>
					<el-button @click.stop="getSymbolInfo()">点击刷新</el-button>
				</template>
			</el-result>
			<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		</div>
	</div>
</template>
