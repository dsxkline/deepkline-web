<script lang="ts" setup>
	import KlineGreenRedIcon from '~/components/icons/KlineGreenRedIcon.vue'
	import KlineRedGreenIcon from '~/components/icons/KlineRedGreenIcon.vue'
	import { usePop } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useKlineStore } from '~/store/kline'
	const { t } = useI18n()
	const props = defineProps<{
		push?: string
	}>()
	const pop = usePop()
	const menus = computed(() => [
		{
			id: 1,
			name: t('红涨绿跌'),
			icon: KlineRedGreenIcon,
			more: useKlineStore().klineColorModel === 'red-green' ? 'CircleCheckFilled' : '',
			callback: () => selectHandle({ id: 1 })
		},
		{
			id: 2,
			name: t('绿涨红跌'),
			icon: KlineGreenRedIcon,
			more: useKlineStore().klineColorModel === 'green-red' ? 'CircleCheckFilled' : '',
			callback: () => selectHandle({ id: 2 })
		}
	])
	const selectHandle = (item: any) => {
		if (item.id === 1) {
			useKlineStore().setKlineColorModel('red-green')
		} else if (item.id === 2) {
			useKlineStore().setKlineColorModel('green-red')
		}
		menus.value.forEach(menu => {
			menu.more = ''
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
		<NavigationBar :title="t('涨跌颜色')" :hideBack="true" />
		<MenuList :menus="menus" />
	</div>
</template>
