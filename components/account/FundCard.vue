<script setup lang="ts">
	import { usePush, useWillAppear } from '~/composable/usePush'
	import { accountFetch } from '~/fetch/account.fetch'
	import { AccountEnvType, type AccountDto } from '~/fetch/dtos/account.d'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import ResetDemo from '~/pages/account/reset-demo.vue'
	import { useAccountStore } from '~/store/account'
	import HistoryOrder from '~/pages/order/history.vue'

	const props = defineProps<{
		account?: AccountDto | null | undefined
		size?: 'small' | 'large'
	}>()

	const loading = ref(false)
	const error = ref('')
	const usepush = usePush()

	const fund = computed(() => {
		return useAccountStore().fund
	})
	const upl = computed(() => {
		return parseFloat(fund?.value?.unrealizedPnl || '0')
	})

	function getUserAccountBalance() {
		if (!useAccountStore().accounts?.length) return
		if (loading.value) return
		if (!fund.value) loading.value = true
		error.value = ''
		accountFetch
			.fund(useAccountStore().currentAccount?.accountId)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					console.log('获取账户余额', result.data)
					const fund = result.data
					if (fund) {
						useAccountStore().setFund(fund)
					}
				} else {
					setTimeout(() => {
						loading.value = false
						if (!fund.value?.total) error.value = result?.msg
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					if (!fund.value?.total) error.value = '网络异常，请稍后再试'
				}, 500)
			})
	}

	function pushReset() {
		usepush(ResetDemo)
	}
	function pushHistoryOrder() {
		usepush(HistoryOrder)
	}

	useWillAppear(() => {
		getUserAccountBalance()
	})

	onMounted(() => {
		getUserAccountBalance()
	})
</script>
<template>
	<div class="p-3 glass mx-4 rounded-md overflow-hidden relative mt-2">
		<div v-if="!loading && !error" class="relative">
			<div class="flex items-center">
				<span class="pb-1 text-sm text-grey">总资产(USDT)</span>
			</div>
			<b v-autosize="25" :class="'roboto-bold flex items-end '" v-if="fund">
				<NumberIncrease :value="formatPrice(parseFloat(fund?.total || '0'), 0.01)" unit="" :fontSize="25" />
			</b>
			<div class="text-sm pt-0 text-grey">
				<span>收益</span>
				<ProfitRate :profit="fund?.profit" :profitRate="fund?.profitRate" />
			</div>

			<div class="flex justify-between items-center pt-6" v-if="size != 'small'">
				<ul class="w-full grid grid-cols-3 *:flex *:flex-col text-grey text-sm [&_b]:text-main [&_b]:pt-1">
					<li>
						<span>可用</span>
						<b>{{ formatPrice(parseFloat(fund?.available || '0'), 0.01, '$') }}</b>
					</li>
					<li class="items-center">
						<span>保证金</span>
						<b>{{ formatPrice(parseFloat(fund?.margin || '0'), 0.01, '$') }}</b>
					</li>
					<li class="items-end">
						<span>冻结</span>
						<b>{{ formatPrice(parseFloat(fund?.frozen || '0'), 0.01, '$') }}</b>
					</li>
				</ul>
			</div>

			<div class="flex justify-between items-center pt-6 *:w-full gap-3 *:!rounded-full *:!py-2 *:overflow-hidden" v-if="size != 'small'">
				<button class="bt-default" @click="pushReset">{{ account?.envType == AccountEnvType.DEMO ? '重置' : '解绑' }}</button>
				<button class="bt-default" @click="pushHistoryOrder">账单</button>
			</div>
			<div v-else class="w-1/3 absolute right-0 top-0 h-full"><LineChart symbol="BTC-USDT" class="w-full h-full" /></div>
		</div>
		<div v-if="loading && !error">
			<div class="flex items-center pb-1">
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 20%; height: 12px" />
					</template>
				</el-skeleton>
			</div>
			<b :class="'roboto-bold flex items-end '" v-if="fund">
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 50%; height: 25px" />
					</template>
				</el-skeleton>
			</b>
			<div class="text-sm pt-0 text-grey">
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 30%; height: 12px" />
					</template>
				</el-skeleton>
			</div>
		</div>
		<div class="min-h-20 flex items-center" v-if="!loading && error">
			<Error :content="error" :hideIcon="true">
				<button @click="getUserAccountBalance">重新加载</button>
			</Error>
		</div>
	</div>
</template>
