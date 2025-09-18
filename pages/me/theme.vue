<script lang="ts" setup>
	import { useStore } from '~/store'
	const { t,locale } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	const menus = computed(()=>[
		{
			id: 1,
			name: t('跟随系统'),
			subName: t('我们将根据您设备的系统设置来自动调整主题'),
            more:useStore().theme === 'system' ? 'CircleCheckFilled' : '',
			callback: () => selectHandle({ id: 1 }),
		},
		{
			id: 2,
			name: t('日间模式'),
            more:useStore().theme === 'light' ? 'CircleCheckFilled' : '',
			callback: () => selectHandle({ id: 2 }),
		},
        {
			id: 3,
			name: t('夜间模式'),
            more:useStore().theme === 'dark' ? 'CircleCheckFilled' : '',
			callback: () => selectHandle({ id: 3 }),
		},
        
	])
    const selectHandle = (item: any) => {
        if (item.id === 1) {
            useStore().setTheme('system')
        } else if (item.id === 2) {
            useStore().setTheme('light')
        } else if (item.id === 3) {
            useStore().setTheme('dark')
        }
        menus.value.forEach(menu => {
            menu.more = ''
            if (menu.id === item.id) {
                menu.more = 'CircleCheckFilled'
            }
        })
    }
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar :title="t('主题设置')" :hideBack="!push" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
	
			<MenuList :menus="menus" />
			
		</ScrollBar>
	</div>
</template>
