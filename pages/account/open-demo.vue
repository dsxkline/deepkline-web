<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import CreateSuccess from './open-success.vue'
	import { accountFetch } from '~/fetch/account.fetch'
import { FetchResultDto } from '~/fetch/dtos/common.dto'
import { useAccountStore } from '~/store/account'
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const loading = ref(false)
	function submitAddAccount() {
		if (loading.value) return
		loading.value = true
		accountFetch
			.open('deepkline')
			.then(async result => {
				if (result?.code == 0) {
					loading.value = false
					await getUserAccounts()
					usepush(CreateSuccess, { account:result.data })
				} else {
					setTimeout(() => {
						loading.value = false
						ElMessage({
							message: result?.msg || '开通失败',
							type: 'error'
						})
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					ElMessage({
						message: '网络异常，请稍后再试',
						type: 'error'
					})
				}, 500)
			})
	}

	async function getUserAccounts() {
		const result = await accountFetch.list()
		if (result?.code == FetchResultDto.OK) {
			console.log('获取账户信息', result.data)
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
		<NavigationBar title="开通模拟账户" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - 44px - var(--safe-bottom))' }" :always="false">
			<div class="p-4 text-xs text-grey border border-[--transparent05] rounded-lg bg-[--transparent05] m-4">
				<div class="text-sm font-bold mb-4 text-main">模拟账户开通说明</div>
				<p class="mb-2">1. 模拟账户是一个用于模拟交易的虚拟账户，您可以在其中进行交易练习。</p>
				<p class="mb-2">2. 模拟账户不涉及真实资金，所有交易均为虚拟操作。</p>
				<p class="mb-2">3. 模拟账户的资金和交易记录不会影响您的真实账户。</p>
				<p class="mb-2">4. 模拟账户的交易数据仅供学习和测试使用。</p>
				<p class="mb-2">5. 您可以随时创建或删除模拟账户。</p>
				<p class="mb-2">6. 模拟账户的交易规则和限制可能与真实账户有所不同，请在使用前仔细阅读相关说明。</p>
				<p class="mb-2">7. 模拟账户的交易结果仅供参考，不代表实际交易结果。</p>
				<p class="mb-2">8. 模拟账户的使用不需要提供任何个人信息或资金。</p>
			</div>
		</ScrollBar>

		<div class="fixed bottom-[var(--safe-bottom)] left-0 right-0 p-4">
			<el-button
					size="large"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default','!bg-brand !text-white']"
					@click="submitAddAccount"
					:loading="loading"
					>确认开通</el-button
				>
		</div>
	</div>
</template>
