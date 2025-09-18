<script lang="ts" setup>
	import { useWillAppear } from '~/composable/usePush'
	import { accountFetch } from '~/fetch/account.fetch'
	import { FetchResultDto, type ChartDto } from '~/fetch/dtos/common.dto'
	import { useAccountStore } from '~/store/account'
	const { t } = useI18n()
	const loading = ref(false)
	const error = ref('')
	const chartDatas = ref<ChartDto[]>([])
	const period = ref<'day' | 'week' | 'month' | 'halfYear' | 'year' | 'full'>('month')
	const currentPeriod = ref('month')
	const periods = computed(()=>[
		// { name: '1日', period: 'day' },
		{ name: t('1周'), period: 'week' },
		{ name: t('1月'), period: 'month' },
		{ name: t('半年'), period: 'halfYear' },
		{ name: t('1年'), period: 'year' },
		{ name: t('全部'), period: 'full' }
	])
	const clickPeriod = (period: string) => {
		if (loading.value) return
		currentPeriod.value = period
		getChartDatas()
	}
	const getChartDatas = async () => {
		const currentAccount = useAccountStore().currentAccount
		if (!currentAccount) return
		if (loading.value) return
		if (!chartDatas.value?.length) loading.value = true
		error.value = ''
		accountFetch
			.chart(currentAccount.exchange, currentAccount.accountId, period.value)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					chartDatas.value = result.data || []
					chartDatas.value.forEach(item => (item.val = parseFloat(parseFloat(String(item.val)).toFixed(2))))
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = t('网络异常，请稍后再试')
			})
	}

	useWillAppear(() => {
		getChartDatas()
	})

	onMounted(() => {
		getChartDatas()
	})

	onBeforeUnmount(() => {})
</script>

<template>
	<div class="px-4 my-4 flex flex-col justify-between">
		<h3 class="pb-2 border-b border-[--transparent05]">{{ t('收益曲线') }}</h3>
		<div class="w-full h-[250px]">
			<Error :content="error" v-if="!loading && error">
				<template #default>
					<el-button @click.stop="getChartDatas">{{ t('重新加载') }}</el-button>
				</template>
			</Error>
			<Empty :content="error" v-if="!loading && !error && !chartDatas.length"> </Empty>
			<Loading v-if="loading && !error" class="w-full h-full"></Loading>
			<LineChart :datas="chartDatas" :showTip="true" class="w-full h-full" :style="[!loading && !error && chartDatas.length ? 'visibility:visible' : 'visibility:hidden']" />
		</div>

		<div class="py-3 border-t border-[--transparent05]" v-if="!loading && !error && chartDatas.length">
			<ul class="flex text-sm justify-between items-center *:px-2 *:py-[2px] *:rounded-full *:text-grey">
				<li @click="clickPeriod(item.period)" :class="[item.period == currentPeriod ? 'bg-[--transparent10] !text-main' : '']" v-for="item in periods">{{ item.name }}</li>
			</ul>
		</div>
	</div>
</template>
