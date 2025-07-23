<script setup lang="ts">
	import { usePush, useWillAppear } from '~/composable/usePush'
	import { useAvatar } from '~/composable/useAvatar'
	import { accountFetch } from '~/fetch/account.fetch'
	import { AccountEnvType, type AccountDto } from '~/fetch/dtos/account.dto'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import ResetDemo from '~/pages/account/reset-demo.vue'
	import { useAccountStore } from '~/store/account'
	import HistoryOrder from '~/pages/order/history.vue'
	import Avatar from '~/pages/me/avatar.vue'
	import { useUserStore } from '~/store/user'
	import defaultAvatar from '~/assets/images/default-avatar.svg'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	const props = defineProps<{
		account?: AccountDto | null | undefined
		size?: 'small' | 'large'
	}>()

	const loading = ref(false)
	const error = ref('')
	const usepush = usePush()

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getUserAccountBalance()
		}
	)

	const fund = computed(() => {
		return useAccountStore().fund
	})
	const upl = computed(() => {
		return parseFloat(fund?.value?.unrealizedPnl || '0')
	})

	function getUserAccountBalance() {
		if (!useAccountStore().accounts?.length) return
		if (loading.value) return
		if (fund.value) return
		loading.value = true
		error.value = ''
		accountFetch
			.fund(useAccountStore().currentAccount?.accountId)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
					console.log('UserFund获取账户余额', result.data)
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

	const imageOnError = (event: Event) => {
		if (event.target) (event.target as HTMLImageElement).src = defaultAvatar
	}

	function pushAvatar() {
		usepush(Avatar)
	}

	function openAccount() {
		useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', '开设账户')
	}

	useWillAppear(() => {
		getUserAccountBalance()
	})

	onMounted(() => {
		getUserAccountBalance()
	})
</script>
<template>
	<div class="rounded-md overflow-hidden relative flex items-center h-full">
		<div class="face-icon flex items-center justify-center relative px-2 cursor-pointer h-full">
			<img
				@error="imageOnError"
				:src="useUserStore()?.user?.face || useAvatar()"
				alt="Face Icon"
				class="w-6 h-6 rounded-full bg-[--transparent05] max-w-max"
				@click.stop="pushAvatar"
				v-if="useUserStore()?.user?.id"
			/>
			<img @error="imageOnError" src="~/assets/images/logo.png" alt="Face Icon" class="w-6 h-6 rounded-full" v-else />
		</div>
		<el-divider direction="vertical" class="mx-1"></el-divider>
		<div v-if="!loading && !error" class="relative flex flex-col justify-center cursor-pointer hover:bg-[--transparent05]">
			<template v-if="useAccountStore().accounts.length">
				<div class="flex justify-between items-center">
					<div class="flex justify-center items-center">
						<div v-if="fund" class="text-sm flex items-center">
							<div class="flex items-center px-2 text-base leading-normal">
								<ExchangeLogo :exchange="useAccountStore().currentAccount?.exchange" class="w-5 h-5 mr-1" />
								<b>{{ phoneStar(useAccountStore().currentAccount?.accountId + '') }}</b>
							</div>
							<span class="pr-2">
								<span :class="['', 'tag-' + (useAccountStore().currentAccount?.envType == 0 ? 'demo' : 'real')]">{{ useAccountStore().currentAccount?.envType == 0 ? '模拟' : '实盘' }}</span>
							</span>
							<b class="text-base"><NumberIncrease :value="formatPrice(parseFloat(fund?.total || '0'), '0.01')" unit="$" :fontSize="16" /></b>
						</div>
						<div class="text-sm text-main pl-2 flex items-center">
							 <ProfitRate :profit="parseFloat(String(fund?.profit || '0'))" :profitRate="parseFloat(String(fund?.profitRate || '0'))" />
						</div>
					</div>
					<div class="pl-3 pr-1 flex items-center">
						<el-icon><ElIconArrowDown /></el-icon>
					</div>
				</div>
			</template>
			<template v-else>
				<button class="bt-brand" @click="openAccount">
					开通账户<el-icon><ArrowRight /></el-icon>
				</button>
			</template>
		</div>

		<div v-if="loading && !error">
			<div class="relative flex flex-col justify-between items-center cursor-pointer min-w-[120px] *:h-4 *:flex *:items-center">
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 100%; height: 8px" />
					</template>
				</el-skeleton>
				<el-skeleton :rows="0" animated>
					<template #template>
						<el-skeleton-item variant="p" style="width: 50%; height: 8px" />
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
