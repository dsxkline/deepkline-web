<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'

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
	const getSymbolInfo = () => {
		if(loading.value) return;
		loading.value = true
		error.value = ''
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
			<el-scrollbar :height="contentHeight + 'px'">
				<div class="p-4">
					<div class="text-sm text-main flex items-center mb-3">
						<img :src="symbolInfo?.icon" alt="" class="w-6 h-6 inline-block mr-1" />
						<span class="font-bold text-[18px]">{{ symbolInfo?.project }}</span>
						
					</div>
					<!-- <span class="text-gray-300 my-3">{{ symbolInfo?.fullName }}</span> -->
					<div class="text-sm text-gray-500 mt-2 h-[100px] overflow-hidden text-ellipsis" v-html="symbolInfo?.introduce"></div>
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
