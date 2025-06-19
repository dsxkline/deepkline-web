<script setup lang="ts">
	import { useWillAppear } from '~/composable/usePush'
	import { accountFetch } from '~/fetch/account.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { useAccountStore } from '~/store/account'

	const loading = ref(false)
	const error = ref('')

	const balance = computed(() => {
		return useAccountStore().balance
	})
	const upl = computed(() => {
		return parseFloat(balance?.value?.upl || '0')
	})

	function getUserAccountBalance() {
		if (!useAccountStore().accounts?.length) return
		if (loading.value) return
		if(!balance.value)loading.value = true
		error.value = ''
		accountFetch
			.balance(useAccountStore().currentAccount?.accountId)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					console.log('获取账户余额', result.data)
					const balance = result.data
					if (balance) {
						useAccountStore().setBalance(balance)
					}
				} else {
					setTimeout(() => {
						loading.value = false
						error.value = result?.msg
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					error.value = '网络异常，请稍后再试'
				}, 500)
			})
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
		<div v-if="!loading && !error">
			<div class="flex items-center">
				<span class="pb-1 text-sm text-grey">总资产(USDT)</span>
			</div>
			<b v-autosize="25" :class="'roboto-bold flex items-end '" v-if="balance">
				<NumberIncrease :value="formatPrice(parseFloat(balance?.totalEq || '0'), 0.01)" unit="" :fontSize="25" />
			</b>
			<div class="text-sm pt-0 text-grey"><span>收益</span><span class="px-1 text-red"> -70.67 (-33.28%)</span></div>
		</div>
		<div v-if="loading && !error">
			<div class="flex items-center pb-1">
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 20%; height: 12px" />
					</template>
				</el-skeleton>
			</div>
			<b :class="'roboto-bold flex items-end '" v-if="balance">
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
