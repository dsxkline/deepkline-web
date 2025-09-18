<script setup lang="ts">
	import { useWillAppear } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { useAccountStore } from '~/store/account'
	import { useStore } from '~/store/index'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import type { MessageCategory, MessageDto } from '~/fetch/dtos/user.dto'
	import { userFetch } from '~/fetch/user.fetch'
	import { MessageEvents } from '~/fetch/dk/dk.websocket'
	import moment from 'moment'
	import { OrderState, OrderStateText, type OrderDto } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { useSymbolStore } from '~/store/symbol'
	const { t } = useI18n()
	const props = defineProps<{
		title?: string
		push?: string
		category: MessageCategory
	}>()

	const pushUp = usePushUp()
	const pushLeft = usePush()
	const loading = ref(true)
	const error = ref('')
	const messages = ref<MessageDto[]>([])
	const messageLoading = ref<Record<number, boolean>>({})
	const page = ref(1)
	const pageSize = ref(30)

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getDatas()
		}
	)

	const getDatas = () => {
		if (!useUserStore().user || !useAccountStore().currentAccount?.accountId) {
			error.value = ''
			loading.value = false
			return
		}
		if (messages.value?.length && page.value == 1) {
			error.value = ''
			loading.value = false
			return
		}
		if (page.value == 1) loading.value = true
		error.value = ''
		userFetch
			.messageList(props.category, page.value, pageSize.value)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					if (page.value <= 1) {
						messages.value = result.data?.list || []
					} else {
						messages.value = messages.value.concat(result.data?.list || [])
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
				error.value = t('网络异常，请稍后再试')
			})
	}

	function getMessageInfo(message: MessageDto) {
		const time = moment(message.createdAt).format('MM/DD HH:mm')
		let content = message.title || message.content
		// 真的成交单
		if (message.payload && message.event == MessageEvents.ORDER) {
			const order = message.payload as OrderDto
			// 现货
			if (order.marketType == MarketType.SPOT) {
				content = `${order.action == 'open' ? t('开仓') : t('平仓')}${order.side == 'buy' ? t('买入') : t('卖出')}`
			} else {
				content = `${order.action == 'open' ? t('开仓') : t('平仓')}${order.action == 'open' ? (order.side == 'buy' ? t('开多') : t('开空')) : order.side == 'buy' ? t('平多') : t('平空')}`
			}
			content += `${getSymbolName(useSymbolStore().getSymbol(order.symbol))},数量:${order.matchSize},${OrderStateText[order.state]}`
			if (order.state == OrderState.FILLED) content += `,成交价格:${order.matchPrice}`
		}
		return `${content}`
	}

	function setAllRead() {
		if (messageLoading.value[-1]) return
		messageLoading.value[-1] = true

		userFetch
			.messageReadAll(props.category)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					messageLoading.value[-1] = false
					messages.value.forEach(item => {
						item.isRead = true
					})
				} else {
					setTimeout(() => {
						messageLoading.value[-1] = false
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					messageLoading.value[-1] = false
				}, 500)
			})
	}
	function setMessageRead(message: MessageDto) {
		if (messageLoading.value[message.id]) return
		messageLoading.value[message.id] = true
		userFetch
			.messageRead(message.id)
			.then(result => {
				messageLoading.value[message.id] = false
				if (result?.code == FetchResultDto.OK) {
					messages.value.forEach(item => {
						if (item.id == message.id) {
							item.isRead = true
						}
					})
					useUserStore().setUnRead(result.data)
				}
			})
			.catch(err => {
				setTimeout(() => {
					messageLoading.value[message.id] = false
				}, 500)
			})
	}

	function update() {
		getDatas()
	}
	function leave() {}

	useWillAppear(() => {
		getDatas()
	})

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

	onMounted(() => {
		getDatas()
	})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="title" :hideBack="!push">
			<template #right>
				<button @click="setAllRead" :class="['mx-4 bt-default', messageLoading[-1] ? '!text-grey' : '']">全部已读 <Loading v-if="messageLoading[-1]" size="12px" class="ml-2" /></button>
			</template>
		</NavigationBar>
		<Empty :content="t('暂无通知')" v-if="!loading && !error && !messages?.length">
			<el-button @click.stop="pushLogin" v-if="!useUserStore().user" class="min-w-[150px]">{{ t('登录') }}</el-button>
			<el-button @click.stop="pushOpenAccount" v-else-if="!useAccountStore().currentAccount?.accountId" class="min-w-[150px]">{{ t('开设账户') }}</el-button>
		</Empty>
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getDatas">{{ t('重新加载') }}</el-button>
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
				<div class="grid grid-cols-2 justify-between items-center text-xs py-0 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
					<el-skeleton :rows="0" animated>
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
		<ScrollBar
			class="w-full h-full"
			:wrap-style="{ height: 'calc(var(--body-height) -var(--title-bar-height) - var(--nav-height) - var(--app-status-bar-height))' }"
			v-if="!loading && !error && messages?.length"
		>
			<ul>
				<li v-for="item in messages" class="p-4 border-b border-[--transparent05] text-sm relative" @click="setMessageRead(item)">
					<div v-if="item.title">{{ item.title }}</div>
					<div class="text-grey py-1">{{ moment(item.createdAt).format('YYYY MM/DD HH:mm') }}</div>
					<div :class="[item.isRead ? 'text-grey' : '']">{{ getMessageInfo(item) }}</div>
					<span :class="['absolute right-4 top-4 text-xs', item.isRead ? 'text-grey' : '']">{{ item.isRead ? t('已读') : t('未读') }}</span>
				</li>
			</ul>
		</ScrollBar>
	</div>
</template>
