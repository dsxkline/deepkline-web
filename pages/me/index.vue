<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	import { usePush, usePushUp, useRefreshChildEvent } from '~/composable/usePush'
	import MeInfo from './info.vue'
	import LanguagesIcon from '~/components/icons/LanguagesIcon.vue'
	import Theme from './theme.vue'
	import Colors from './colors.vue'
	import { useKlineStore } from '~/store/kline'
	import KlineGreenRedIcon from '~/components/icons/KlineGreenRedIcon.vue'
	import KlineRedGreenIcon from '~/components/icons/KlineRedGreenIcon.vue'
	import Timezone from './timezone.vue'
	import About from './about.vue'
	import Login from '../login/index.vue'
	import { useUserStore } from '~/store/user'
	import Security from './security.vue'
	import Notification from './notification.vue'
	import LoginIndex from '../login/index.vue'
	import AccountSyncIcon from '~/components/icons/account/AccountSyncIcon.vue'
	import AccountList from '../account/account-list.vue'
	import Languages from './languages.vue'
	const { t,localeProperties } = useI18n()
	const props = defineProps<{
		push?: string,
		height?: number
	}>()
	let usepush = usePush()
	let pushUp = usePushUp()
	const menus = computed(() => [
		{
			id: 1,
			name: t('个人资料'),
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
			name: t('安全设置'),
			subName: '',
			icon: 'Lock',
			desc: '',
			hide: !useUserStore().user?.id,
			callback: () => {
				usepush(Security)
			}
		},
		// {
		// 	id: 3,
		// 	name: '钱包',
		// 	subName: '',
		// 	icon: 'Wallet',
		// 	desc: '',
		// 	hide: !useUserStore().user?.id,
		// 	callback: () => {}
		// },
		{
			id: 4,
			name: t('通知'),
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
			name: t('在线反馈'),
			subName: '',
			icon: 'Help',
			desc: '',
			callback: () => {}
		},

		{
			id: 6,
			name: t('语言'),
			subName: '',
			icon: markRaw(LanguagesIcon),
			desc: localeProperties.value.name,
			callback: () => {
				usepush(Languages)
			}
		},

		{
			id: 7,
			name: t('主题'),
			subName: '',
			icon: 'Moon',
			desc: t('夜间模式'),
			callback: () => {
				usepush(Theme)
			}
		},
		{
			id: 8,
			name: t('涨跌幅周期和K线时间'),
			subName: '',
			icon: 'Clock',
			desc: useKlineStore().timezone === 'UTC+8' ? 'UTC+8' : useKlineStore().timezone === 'UTC' ? 'UTC' : '24小时制',
			callback: () => {
				pushUp(Timezone)
			}
		},
		{
			id: 9,
			name: t('涨跌颜色'),
			subName: '',
			icon: 'DataLine',
			desc: useKlineStore().klineColorModel === 'red-green' ? t('红涨绿跌') : t('绿涨红跌'),
			descIcon: markRaw(useKlineStore().klineColorModel === 'red-green' ? KlineRedGreenIcon : KlineGreenRedIcon),
			callback: () => {
				pushUp(Colors)
			}
		},
		// {
		// 	id: 10,
		// 	name: '交易记录',
		// 	subName: '',
		// 	icon: 'Tickets',
		// 	desc: '',
		// 	hide: !useUserStore().user?.id,
		// 	callback: () => {}
		// },
		{
			id: 11,
			name: t('关于'),
			subName: '',
			icon: 'Postcard',
			desc: '',
			callback: () => {
				usepush(About)
			}
		}
	])
	watch(
		() => useStore().theme,
		theme => {
			menus.value.forEach(menu => {
				if (menu.id === 7) {
					menu.desc = theme === 'dark' ? t('夜间模式') : t('日间模式')
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
					menu.desc = colorModel === 'red-green' ? t('红涨绿跌') : t('绿涨红跌')
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
					menu.desc = timezone === 'UTC+8' ? 'UTC+8' : timezone === 'UTC' ? 'UTC' : t('24小时制')
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
		} else {
			pushUp(LoginIndex,{},'100%')
		}
	}

	onMounted(() => {
		console.log('meindex.height',props.height)
	})
	onBeforeUnmount(() => {
		// console.log('Me component unmounted, menus cleared')
	})
	onUnmounted(() => {
		// console.log('Me component unmounted')
	})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('我的')" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2 px-4" @click="pushAccountList">
					<AccountSyncIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }" :always="false">
			<UserFace v-if="useUserStore().user" />
			<LoginCard v-else :title="t('欢迎回来')" :desc="t('实战才是检验真理的唯一标准')" />
			<MenuList :menus="menus" :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height) - 170px)' }" />
			<div class="my-3 px-3 pb-5 flex flex-col items-center justify-center">
				<button class="logout-bt glass w-full bt-default !py-3 !rounded-full mb-3 !text-sm overflow-hidden" @click="logout" v-if="useUserStore().user">退出登录 <LogoutIcon class="w-4 ml-2" /></button>
				<el-divider class="!my-3" />
				<div class="text-center text-xs text-muted">version 1.0.0</div>
			</div>
		</ScrollBar>
	</div>
</template>
