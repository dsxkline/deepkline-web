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
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = ref([
		{
			id: 1,
			name: '系统通知',
			// icon: markRaw(SystemNotificationIcon),
			subName: '接收站内动态、产品功能以及优惠活动',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '预警通知',
			// icon: markRaw(WarningNotificationIcon),
			subName: '接收价格预警通知',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '订单通知',
			// icon:markRaw(OrderNotificationIcon),
			subName: '接收挂单、成交单通知',
			desc: '',
			callback: () => {}
		},
		
	])
	const usepush = usePush()
	const pushNotificationSetting = ()=>{
		usepush(NotificationSetting)
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="消息通知" :hideBack="!push">
			<template #right>
				<button @click="pushNotificationSetting" class="px-4">
					<el-icon class="!w-5 !h-5"><Setting class="!w-5 !h-5"/></el-icon>
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<MenuList :menus="menus" size="large"/>
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped>
:deep(.menu-list){
	&.large ul li .icon svg{
		background-color: white;
		border-radius: 999px;
	}
}
</style>