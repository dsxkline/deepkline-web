<script lang="ts" setup>
	import { ref } from 'vue'
	import { useStore } from '~/store'
	import type { MenuModel } from './common/TabBar.vue'
	const props = defineProps<{
		menus: MenuModel[]
		active?: number
	}>()

	const menuActive = ref(props.active || 0)

	const emit = defineEmits<{
		(event: 'update:active', value: number): void
		(event: 'menuHandler', menu: MenuModel, index: number): void
	}>()

	const handleOpen = (menu: MenuModel, index: number) => {
		console.log('handleOpen', menu, index)
		menuActive.value = index
		emit('update:active', index)
		emit('menuHandler', menu, index)
	}
</script>

<template>
	<div class="left-menu flex flex-col justify-between border-r border-[--border-color] bg-[var(--transparent10)]">
		<div class="main-menu">
			<ul class="menu-list w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted *:min-h-[76px]">
				<li
					:class="menuActive == index ? '!text-green border-l-2 border-green-500 font-bold' : 'hover:bg-[var(--transparent05)] hover:text-muted' + ''"
					v-for="(menu, index) in props.menus"
					:key="menu.name"
					click-sound
					@click="handleOpen(menu, index)"
				>
					<component :is="menu.icon" class="w-5" v-if="menu.icon" />
					<span v-if="menu.name" class="py-2">{{ menu.name }}</span>
				</li>
			</ul>

			<ul class="menu-list-h5 w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted *:min-h-[76px]">
				<li
					:class="menuActive == index ? '!text-green border-l-2 border-green-500 font-bold' : 'hover:bg-[var(--transparent05)] hover:text-muted' + ''"
					v-for="(menu, index) in props.menus"
					:key="menu.name"
					click-sound
					@click="handleOpen(menu, index)"
				>
					<component :is="menu.iconSelected" class="w-8" v-if="menu.icon && menuActive == index && menu.iconSelected" />
					<component :is="menu.icon" class="w-5" v-else-if="menu.icon" />
					<template v-if="menu.name && menuActive == index && menu.iconSelected"></template>
					<span v-else-if="menu.name" class="py-2">{{ menu.name }}</span>
				</li>
			</ul>
		</div>
		<div class="other-menu">
			<ul class="w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xls *:cursor-pointer *:text-muted">
				<li>
					<el-icon class="!w-[20px] !h-[20px] text-muted :hover:text-main"><Setting class="!w-[20px] !h-[20px]" /></el-icon>
				</li>
			</ul>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.menu-list-h5 {
		display: none;
	}
	@media (max-width: 999px) {
		.menu-list-h5 {
			display: block;
		}
		.left-menu {
			background-color: rgb(var(--color-bg-base));
			position: fixed;
			bottom: 0;
			z-index: 10;
			width: var(--body-width);
			display: flex;
			flex-direction: column;

			.other-menu {
				display: none;
			}
			.main-menu {
				background: var(--transparent10);
				padding-bottom: calc(var(--safe-bottom) - 8px);
				ul {
					height: var(--menu-height);
					width: 100% !important;
					display: flex;
					flex-direction: row;
					align-items: center;
					display: grid;
					grid-template-columns: 25% 25% 25% 25%;
					li {
						height: var(--menu-height);
						min-height: auto;
						flex: 1;
						padding: 0 12px;
						align-items: center;
						border: none;
						background: none;
						span {
							padding-bottom: 0;
							padding-top: 3px;
						}
					}
				}
				.menu-list {
					display: none;
				}
			}
		}
	}
</style>
