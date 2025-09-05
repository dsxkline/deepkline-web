<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderState, type OrderDto, OrderType } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { MarginMode, Sides } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useAccountStore } from '~/store/account'
	import { useOrderStore } from '~/store/order'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import { useStore } from '~/store'
	import type { TradeDto } from '~/fetch/dtos/trade.dto'
	import type { FundLogsDto, FundLogType } from '~/fetch/dtos/account.dto'
	import { accountFetch } from '~/fetch/account.fetch'
	const props = defineProps<{
		height: number
	}>()
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height
	})
	const pushUp = usePushUp()
	const pushLeft = usePush()
	const loading = ref(false)
	const error = ref('')
	const loadingCancel = ref<Record<string, boolean>>({})
	const page = ref(1)
	const pageSize = ref(30)
	const symbol = ref()
	const changeType = ref<FundLogType>()
	const fundLogs = ref<FundLogsDto[]>([])

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getDatas()
		}
	)

	const getDatas = () => {
		if (loading.value) return
		if (!useUserStore().user || !useAccountStore().currentAccount?.accountId) {
			error.value = ''
			loading.value = false
			return
		}
		if (fundLogs.value?.length && page.value == 1) {
			error.value = ''
			loading.value = false
			return
		}
		if (page.value == 1) loading.value = true
		error.value = ''
		accountFetch
			.fundLogsList(useAccountStore().currentAccount?.accountId, symbol.value, changeType.value, page.value, pageSize.value)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					if (page.value <= 1) {
						fundLogs.value = result.data?.list || []
					} else {
						fundLogs.value = fundLogs.value.concat(result.data?.list || [])
					}
					// 没有
					if (result.data?.total) {
						const totalPages = Math.ceil(result.data?.total / result.data?.pageSize)
						if (page.value < totalPages) page.value += 1
					}
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function pushLogin() {
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex)
				return
			} else {
				useNuxtApp().$dialog(LoginIndex, {}, '600px', '560px')
				return
			}
		}
	}

	function pushOpenAccount() {
		if (!useAccountStore().accounts?.length) {
			if (useStore().isH5) {
				pushLeft(ExchangeIndex)
				return
			} else {
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', '开设账户')
				return
			}
		}
	}

	function update() {
		getDatas()
	}
	function leave() {}

	onMounted(() => {})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>

<template>
	<div class="px-4 h-full w-full" :style="{ minHeight: contentHeight ? contentHeight + 'px' : 'auto' }">
		<Empty :content="'暂无交易账单'" v-if="!loading && !error && !fundLogs?.length" class="pt-20">
			<el-button @click.stop="pushLogin" v-if="!useUserStore().user" class="min-w-[150px]">登录</el-button>
			<el-button @click.stop="pushOpenAccount" v-else-if="!useAccountStore().currentAccount?.accountId" class="min-w-[150px]">开设账户</el-button>
		</Empty>
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getDatas">点击刷新</el-button>
			</template>
		</Error>
		<ul v-if="loading && !error">
			<li class="border-b border-[--transparent05] py-3" v-for="item in pageSize">
				<div class="flex justify-between">
					<div class="flex items-center w-full">
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 18px" />
							</template>
						</el-skeleton>
					</div>
					<div class="flex justify-between items-center gap-4"></div>
				</div>
				<div class="py-0 flex items-center">
					<el-skeleton :rows="0" animated class="flex items-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 30%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
					<el-skeleton :rows="0" animated>
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-right">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="flex items-center gap-2 justify-between *:flex-1"></div>
			</li>
		</ul>
		<ScrollBar class="w-full" :noScroll="!contentHeight" :style="{ height: contentHeight ? contentHeight + 'px' : 'auto' }" ref="scrollbar" v-if="!loading && !error && fundLogs?.length">
			<ul v-if="!loading && !error && fundLogs?.length">
				<template v-for="item in fundLogs" :key="item.orderId">
					<li class="border-b border-[--transparent05] py-3">
						<div class="flex justify-between">
							<div class="flex items-center">
								<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" class="text-base roboto-bold leading-[0]" />
							</div>
							<div class="flex justify-between items-center gap-4">
								{{ item.amount }}
							</div>
						</div>
						<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1 [&_b]:pb-2"></div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
