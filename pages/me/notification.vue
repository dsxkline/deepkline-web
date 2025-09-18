<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	import SystemNotificationIcon from '~/components/icons/notification/SystemNotificationIcon.vue'
	import WarningNotificationIcon from '~/components/icons/notification/WarningNotificationIcon.vue'
	import OrderNotificationIcon from '~/components/icons/notification/OrderNotificationIcon.vue'
	import ClinchNotificationIcon from '~/components/icons/notification/ClinchNotificationIcon.vue'
	import ForcedNotificationIcon from '~/components/icons/notification/ForcedNotificationIcon.vue'
	import NotificationSetting from './notification-setting.vue'
	import { usePush } from '~/composable/usePush'
	import NotificationList from './notification-list.vue'
	import { MessageCategory, type MessageDto, type MessageUnReadRespDto } from '~/fetch/dtos/user.dto'
	import { userFetch } from '~/fetch/user.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import moment from 'moment'
	import { MessageEvents } from '~/fetch/dk/dk.websocket'
	import { OrderState, OrderStateText, type OrderDto } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { useUserStore } from '~/store/user'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const unReads = computed(() => useUserStore().unRead)
	const menus = computed(() => {
		return [
			{
				id: 1,
				name: t('系统消息'),
				// icon: markRaw(SystemNotificationIcon),
				subName: unReads.value?.system?.content ? getMessageInfo(unReads.value.trade.content) : '',
				badge: unReads.value?.system?.count,
				callback: () => {
					pushNotificationList(t('系统消息'), MessageCategory.SYSTEM)
				}
			},
			{
				id: 1,
				name: t('预警消息'),
				// icon: markRaw(WarningNotificationIcon),
				subName: unReads.value?.warning?.content ? getMessageInfo(unReads.value.trade.content) : '',
				badge: unReads.value?.warning?.count,
				callback: () => {
					pushNotificationList(t('预警消息'), MessageCategory.WARNING)
				}
			},
			{
				id: 1,
				name: t('交易提醒'),
				// icon:markRaw(OrderNotificationIcon),
				subName: unReads.value?.trade?.content ? getMessageInfo(unReads.value.trade.content) : '',
				badge: unReads.value?.trade?.count,
				callback: () => {
					pushNotificationList(t('交易提醒'), MessageCategory.TRADE)
				}
			}
		]
	})

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
			content += `${getSymbolName(useSymbolStore().getSymbol(order.symbol))},${t('数量')}:${order.matchSize},${OrderStateText[order.state]}`
			if (order.state == OrderState.FILLED) content += `,${t('成交价格')}:${order.matchPrice}`
		}
		return `${time} ${content}`
	}

	const getDatas = () => {
		userFetch
			.messageUnRead()
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					useUserStore().setUnRead(result.data)
				}
			})
			.catch(err => {})
	}

	const usepush = usePush()
	const pushNotificationSetting = () => {
		usepush(NotificationSetting)
	}
	const pushNotificationList = (title: string, category: MessageCategory) => {
		usepush(NotificationList, {
			title,
			category
		})
	}
	onMounted(() => {
		getDatas()
	})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('消息通知')" :hideBack="!push">
			<template #right>
				<button @click="pushNotificationSetting" class="px-4">
					<el-icon class="!w-5 !h-5"><Setting class="!w-5 !h-5" /></el-icon>
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<MenuList :menus="menus" size="large" />
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped>
	:deep(.menu-list) {
		&.large ul li .icon svg {
			background-color: white;
			border-radius: 999px;
		}
	}
</style>
