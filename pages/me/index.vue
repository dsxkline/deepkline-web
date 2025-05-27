<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import UserFace from '~/components/user/UserFace.vue'
	import { usePush } from '~/composable/usePush'
	import MeInfo from './info.vue'
	import LanguagesIcon from '~/components/icons/LanguagesIcon.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const push = usePush()
	const menus = ref([
		{
			id: 1,
			name: '个人资料',
			subName: '已认证',
			icon: 'User',
			desc: '',
			callback: () => {
				push(MeInfo)
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
			id: 1,
			name: '安全设置',
			subName: '',
			icon: 'Lock',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '钱包',
			subName: '',
			icon: 'Wallet',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '通知',
			subName: '',
			icon: 'Bell',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '帮助与反馈',
			subName: '',
			icon: 'Help',
			desc: '',
			callback: () => {}
		},

		{
			id: 1,
			name: '语言',
			subName: '',
			icon: LanguagesIcon,
			desc: '简体中文',
			callback: () => {}
		},

		{
			id: 1,
			name: '主题',
			subName: '',
			icon: 'Moon',
			desc: '深色模式',
			callback: () => {}
		},
		{
			id: 1,
			name: '涨跌幅周期和K线时间',
			subName: '',
			icon: 'Clock',
			desc: 'UTC+8',
			callback: () => {}
		},
		{
			id: 1,
			name: '颜色设置',
			subName: '',
			icon: 'DataLine',
			desc: '绿涨红跌',
			callback: () => {}
		},
		{
			id: 2,
			name: '交易记录',
			subName: '',
			icon: 'Tickets',
			desc: '',
			callback: () => {}
		},
		{
			id: 1,
			name: '关于',
			subName: '',
			icon: 'Postcard',
			desc: '',
			callback: () => {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="我的" :hideBack="!push" />
		<el-scrollbar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }">
			<UserFace />
			<MenuList :menus="menus" />
			<div class="my-3 px-3 flex flex-col items-center justify-center mt-20">
				<button class="w-full bt-default !py-2 !rounded-full mb-3" @click="push(MeInfo)">退出登录</button>
				<el-divider class="!my-3" />
				<div class="text-center text-xs text-muted">版本 1.0.0</div>
			</div>
		</el-scrollbar>
	</div>
</template>
