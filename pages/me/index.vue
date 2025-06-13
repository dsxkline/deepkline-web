<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import MeInfo from './info.vue'
	import LanguagesIcon from '~/components/icons/LanguagesIcon.vue'
	import Theme from './theme.vue'
	import Colors from './colors.vue'
	import { useKlineStore } from '~/store/kline'
	import KlineGreenRedIcon from '~/components/icons/KlineGreenRedIcon.vue'
	import KlineRedGreenIcon from '~/components/icons/KlineRedGreenIcon.vue'
	import Timezone from './timezone.vue'
	import Aboutus from './aboutus.vue'
	import Login from '../login/index.vue'
	import { useUserStore } from '~/store/user'
	import Security from './security.vue'
	import Notification from './notification.vue'
	import LoginIndex from '../login/index.vue'
	import AccountSyncIcon from '~/components/icons/account/AccountSyncIcon.vue'
	import AccountList from '../account/account-list.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	let usepush = usePush()
	let pushUp = usePushUp()
	const menus = computed(() => [
		{
			id: 1,
			name: '个人资料',
			subName: '',
			icon: 'User',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {
				usepush(MeInfo)
			}
		},

		// {
		// 	id: 1,
		// 	name: '国家或地区',
		// 	subName: '',
		// 	icon: 'Map',
		// 	desc: '中国',
		// 	callback: () => {}
		// },
		{
			id: 2,
			name: '安全设置',
			subName: '',
			icon: 'Lock',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {
				usepush(Security)
			}
		},
		{
			id: 3,
			name: '钱包',
			subName: '',
			icon: 'Wallet',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {}
		},
		{
			id: 4,
			name: '通知',
			subName: '',
			icon: 'Bell',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {
				usepush(Notification)
			}
		},
		{
			id: 5,
			name: '帮助与反馈',
			subName: '',
			icon: 'Help',
			desc: '',
			callback: () => {}
		},

		{
			id: 6,
			name: '语言',
			subName: '',
			icon: markRaw(LanguagesIcon),
			desc: '简体中文',
			callback: () => {}
		},

		{
			id: 7,
			name: '主题',
			subName: '',
			icon: 'Moon',
			desc: '夜间模式',
			callback: () => {
				usepush(Theme)
			}
		},
		{
			id: 8,
			name: '涨跌幅周期和K线时间',
			subName: '',
			icon: 'Clock',
			desc: useKlineStore().timezone === 'UTC+8' ? 'UTC+8' : useKlineStore().timezone === 'UTC' ? 'UTC' : '24小时制',
			callback: () => {
				pushUp(Timezone)
			}
		},
		{
			id: 9,
			name: '涨跌颜色',
			subName: '',
			icon: 'DataLine',
			desc: useKlineStore().klineColorModel === 'red-green' ? '红涨绿跌' : '绿涨红跌',
			descIcon: markRaw(useKlineStore().klineColorModel === 'red-green' ? KlineRedGreenIcon : KlineGreenRedIcon),
			callback: () => {
				pushUp(Colors)
			}
		},
		{
			id: 10,
			name: '交易记录',
			subName: '',
			icon: 'Tickets',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {}
		},
		{
			id: 11,
			name: '关于',
			subName: '',
			icon: 'Postcard',
			desc: '',
			callback: () => {
				usepush(Aboutus)
			}
		}
	])
	watch(
		() => useStore().theme,
		theme => {
			menus.value.forEach(menu => {
				if (menu.id === 7) {
					menu.desc = theme === 'dark' ? '夜间模式' : '日间模式'
					menu.icon = theme === 'dark' ? 'Moon' : 'Sunny'
				}
			})
		}
	)
	watch(
		() => useKlineStore().klineColorModel,
		colorModel => {
			menus.value.forEach(menu => {
				if (menu.id === 9) {
					menu.desc = colorModel === 'red-green' ? '红涨绿跌' : '绿涨红跌'
					menu.descIcon = colorModel === 'red-green' ? KlineRedGreenIcon : KlineGreenRedIcon
				}
			})
		}
	)
	watch(
		() => useKlineStore().timezone,
		timezone => {
			menus.value.forEach(menu => {
				if (menu.id === 8) {
					menu.desc = timezone === 'UTC+8' ? 'UTC+8' : timezone === 'UTC' ? 'UTC' : '24小时制'
				}
			})
		}
	)
	function logout() {
		useUserStore().logout()
	}

	function pushAccountList() {
		if (useUserStore().user) {
			usepush(AccountList)
		}else{
			pushUp(LoginIndex)
		}
	}

	onMounted(() => {
		// setTimeout(() => {
		// 	useNuxtApp().$pop()
		// }, 1000)
	})
	onBeforeUnmount(() => {
		console.log('Me component unmounted, menus cleared')
	})
	onUnmounted(() => {
		console.log('Me component unmounted')
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="我的" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2" @click="pushAccountList">
					<AccountSyncIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }" :always="false">
			<UserFace />
			<MenuList :menus="menus" />
			<div class="my-3 px-3 pb-5 flex flex-col items-center justify-center">
				<button class="logout-bt glass w-full bt-default !py-3 !rounded-full mb-3 !text-sm" @click="logout" v-if="useUserStore().user">退出登录 <LogoutIcon class="w-4 ml-2"/></button>
				<el-divider class="!my-3" />
				<div class="text-center text-xs text-muted">版本 1.0.0</div>
			</div>
		</ScrollBar>
	</div>
</template>
