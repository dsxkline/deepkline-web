<script lang="ts" setup>
	import { ref } from 'vue'
	import { useStore } from '~/store'
	import type { MenuModel } from './common/TabBar.vue'
import { getCssVariable } from '~/composable/useCommon';
	const props = defineProps<{
		menus: MenuModel[]
		active?: number
	}>()

	const menuActive = ref(props.active || 0)
	const mainMenu = ref()

	const emit = defineEmits<{
		(event: 'update:active', value: number): void
		(event: 'menuHandler', menu: MenuModel, index: number): void
	}>()

	const handleOpen = (menu: MenuModel, index: number) => {
		//console.log('handleOpen', menu, index)
		menuActive.value = index
		emit('update:active', index)
		emit('menuHandler', menu, index)
	}

	onMounted(()=>{
		nextTick(()=>{
			const safeBottom = getCssVariable('--safe-bottom')
			//console.log('mainMenu',mainMenu.value.clientHeight, safeBottom)
		})
	})
</script>

<template>
	<div class="left-menu relative flex flex-col justify-between border-r border-[--border-color]">
		<div class="main-menu" ref="mainMenu">
			<ul class="menu-list w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted *:min-h-[76px]">
				<li
					:class="menuActive == index ? 'active' : 'hover:bg-[var(--transparent05)] hover:text-muted' + ''"
					v-for="(menu, index) in props.menus"
					:key="menu.name"
					v-click-sound
					@click="handleOpen(menu, index)"
				>
					<component :is="menu.icon" class="w-5" v-if="menu.icon" />
					<span v-if="menu.name" class="py-2">{{ menu.name }}</span>
				</li>
			</ul>

			<ul :style="['grid-template-columns:'+(menus.map(()=>1/menus.length*100+'%').join(' '))]" class="menu-list-h5 w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted *:min-h-[76px]">
				<li
					:class="menuActive == index ? '!text-brand font-bold' : 'hover:bg-[var(--transparent05)] hover:text-muted' + ''"
					v-for="(menu, index) in menus"
					:key="menu.name"
					v-click-sound
					@click="handleOpen(menu, index)"
				>
					<component :is="menu.iconSelected" class="w-8" v-if="menu.icon && menuActive == index && menu.iconSelected" />
					<component :is="menu.icon" class="w-6" v-else-if="menu.icon" />
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
	.light .left-menu {
		&::before {
			opacity: 0.3;
			background-image: none;
		}
		.main-menu {
			.active {
				@apply text-brand;
			}
		}
	}
	.left-menu {
		&::before {
			background-image: var(--bg-linear-180);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.1;
		}
		.main-menu {
			.active {
				border-left: 2px solid var(--brand-color);
				@apply text-main;
				background: var(--transparent05);
			}
		}
	}
	.menu-list-h5 {
		display: none;
	}
	@media (max-width: 999px) {
		.menu-list-h5 {
			display: block;
		}
		.left-menu {
			background: rgb(var(--color-bg-base));
			&::before {
				background-image: var(--bg-linear-90);
				opacity: 0.2;
			}
			position: fixed;
			bottom: 0;
			z-index: 100;
			width: var(--body-width);
			display: flex;
			flex-direction: column;

			.other-menu {
				display: none;
			}
			.main-menu {
				background: var(--transparent05);
				padding-bottom: calc(var(--safe-bottom) - 8px);
				ul {
					height: var(--menu-height);
					width: 100% !important;
					display: flex;
					flex-direction: row;
					align-items: center;
					display: grid;
					
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
						&.active {
							color: var(--color-brand);
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
