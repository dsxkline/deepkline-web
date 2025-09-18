<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import CreateSuccess from './open-success.vue'
	import { accountFetch } from '~/fetch/account.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { useAccountStore } from '~/store/account'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const loading = ref(false)
	function submitResetAccount() {
		const accountId = useAccountStore().currentAccount?.accountId
		if (!accountId) return
		if (loading.value) return
		loading.value = true
		accountFetch
			.reset('deepkline', accountId)
			.then(async result => {
				if (result?.code == 0) {
					loading.value = false
					await getUserAccounts()
					ElMessage({
						message: t('重置成功'),
						type: 'success'
					})
					useAccountStore().reset(accountId)
					useNuxtApp().$pop()
				} else {
					setTimeout(() => {
						loading.value = false
						ElMessage({
							message: result?.msg || t('开通失败'),
							type: 'error'
						})
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					ElMessage({
						message: t('网络异常，请稍后再试'),
						type: 'error'
					})
				}, 500)
			})
	}

	async function getUserAccounts() {
		const result = await accountFetch.list()
		if (result?.code == FetchResultDto.OK) {
			// console.log('获取账户信息', result.data)
			const accounts = result.data
			if (accounts) {
				useAccountStore().setAccounts(accounts)
			}
		}
	}

	onMounted(() => {
		getUserAccounts()
	})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar :title="t('重置账户')" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - 44px - var(--safe-bottom))' }" :always="false">
			<div class="flex flex-col items-center justify-center">
				<ResetBannerIcon class="w-1/2 m-0" />
			</div>
			<div class="p-4 text-xs text-grey border border-[--transparent05] rounded-lg bg-[--transparent05] m-4">
				<div class="text-sm font-bold mb-4 text-main">{{ t('重置账户说明') }}</div>
				<p class="mb-2">{{t('重置账户将清除所有账户交易信息，请谨慎操作')}}。</p>
			</div>
		</ScrollBar>

		<div class="fixed bottom-[var(--safe-bottom)] left-0 right-0 p-4">
			<el-button size="large" :class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', '!bg-brand !text-white']" @click="submitResetAccount" :loading="loading">{{ t('确认重置') }}</el-button>
		</div>
	</div>
</template>
