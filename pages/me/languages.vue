<script lang="ts" setup>
	import { useSyncedCookie } from '~/composable/useSyncedCookie'
	import { useStore } from '~/store'
	import type { MenuListModel } from '~/types/types'
	const { locales, locale, setLocale, t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = ref<MenuListModel[]>(
		locales.value.map((item, index) => {
			return {
				id: index,
				code: item.code as string,
				name: item.name as string,
				more: locale.value == item.code ? 'CircleCheckFilled' : '',
				callback: () => selectHandle({ code: item.code })
			}
		})
	)
	const selectHandle = (item: { code: any }) => {
		useSyncedCookie('i18n_redirected', { default: () => 'zh-CN' }).value = item.code
		// 1) SPA 切换：直接改语言，不跳转
		setLocale(item.code)
		menus.value.forEach(menu => {
			menu.more = ''
			if (menu.code === item.code) {
				menu.more = 'CircleCheckFilled'
			}
		})
		setTimeout(() => {
			useNuxtApp().$pop()
		}, 500)
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('语言设置')" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<MenuList :menus="menus" />
		</ScrollBar>
	</div>
</template>
