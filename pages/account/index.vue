<script lang="ts" setup>
	import AccountList from './account-list.vue'
	import { usePush, usePushUp, useRefreshChildEvent } from '~/composable/usePush'
	import ExchangeIndex from '../exchange/index.vue'
	import { useAccountStore } from '~/store/account'
	import FundCard from '~/components/account/FundCard.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const pushLeft = usePush()
	const pushUp = usePushUp()
	function pushAccountList() {
		pushLeft(AccountList)
	}
	function pushAccounts() {
		pushUp(AccountList, {}, 'auto')
	}

	onMounted(() => {})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="w-full h-full">
		<ExchangeIndex v-if="!useAccountStore().accounts?.length" />
		<template v-else>
			<NavigationBar title="" :hideBack="!push">
				<template #left>
					<div class="flex justify-center items-center px-4" @click="pushAccounts">
						<div class="flex items-center pr-1 text-lg leading-normal">
							<ExchangeLogo :exchange="useAccountStore().currentAccount?.exchange" class="w-4 h-4 mr-1" />
							<b>{{ phoneStar(useAccountStore().currentAccount?.accountId + '') }}</b>
						</div>
						<span :class="['mr-2', 'tag-' + (useAccountStore().currentAccount?.envType == 0 ? 'demo' : 'real')]">{{ useAccountStore().currentAccount?.envType == 0 ? '模拟' : '实盘' }}</span>
						<el-icon><ElIconArrowDownBold /></el-icon>
					</div>
				</template>
				<template #right>
					<button class="flex items-center p-2 px-4" @click="pushAccountList">
						<AccountSyncIcon class="w-5 h-5" />
					</button>
				</template>
			</NavigationBar>
			<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--safe-bottom))' }" :always="false">
				<div :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height)  - var(--menu-height) - var(--safe-bottom) + 1px)' }">
					<FundCard :account="useAccountStore().currentAccount" />
					<AccountProfitChart class="h-[250px]" />
					<AccountCryptoAssets />
				</div>
			</ScrollBar>
		</template>
	</div>
</template>
