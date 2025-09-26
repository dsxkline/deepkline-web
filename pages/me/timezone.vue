<script lang="ts" setup>
	import { usePop } from '~/composable/usePush'
	import { useKlineStore } from '~/store/kline'
	import type { MenuListModel } from '~/types/types'
	const { t, locale } = useI18n()
	const props = defineProps<{
		push?: string
	}>()
	const pop = usePop()
	const menus = ref<MenuListModel[]>([
		{
			id: 1,
			name: 'UTC+8',
			subName: t('涨跌幅和K线开盘价从00:00(UTC+8)开始计算'),
			more: useKlineStore().timezone === 'UTC+8' ? 'CircleCheckFilled' : false,
			callback: () => selectHandle({ id: 1 })
		},
		{
			id: 2,
			name: 'UTC',
			subName: t('涨跌幅和K线开盘价从00:00开始计算'),
			more: useKlineStore().timezone === 'UTC' ? 'CircleCheckFilled' : false,
			callback: () => selectHandle({ id: 2 })
		},
		{
			id: 3,
			name: t('24小时制'),
			subName: t('涨跌幅取过去24小时数据，K线开盘价从00:00 UTC 开始计算'),
			more: useKlineStore().timezone === '24' ? 'CircleCheckFilled' : false,
			callback: () => selectHandle({ id: 3 })
		}
	])
	const selectHandle = (item: any) => {
		if (item.id === 1) {
			useKlineStore().setTimezone('UTC+8')
		} else if (item.id === 2) {
			useKlineStore().setTimezone('UTC')
		} else if (item.id === 3) {
			useKlineStore().setTimezone('24')
		}
		menus.value.forEach(menu => {
			menu.more = false
			if (menu.id === item.id) {
				menu.more = 'CircleCheckFilled'
			}
		})
		pop()
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full pb-8">
		<AppStatusBar />
		<NavigationBar :title="t('涨跌幅周期和K线时区')" :hideBack="true" />
		<MenuList :menus="menus" />
	</div>
</template>
