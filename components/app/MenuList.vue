<script setup lang="ts">
	import type { MenuListModel } from '~/types/types'

	const props = defineProps<{
		menus: MenuListModel[]
		size?: '' | 'large'
	}>()

	onBeforeUnmount(() => {
		// 清理工作
		//console.log('MenuList component is being destroyed')
	})
</script>
<template>
	<div :class="['menu-list w-full flex flex-col', size]" v-if="menus && menus.length > 0">
		<ul>
			<template v-for="(item, index) in menus">
				<li :key="index" v-if="!item.hide" class="flex justify-between items-center p-3 hover:bg-[var(--transparent05)] cursor-pointer" @click="item.callback">
					<div class="flex items-center icon w-2/3">
						<component :is="item.icon" class="w-5 h-5 mr-2" v-if="item.icon"></component>
						<div class="flex flex-col title w-full">
							<span class="text-base">{{ item.name }}</span>
							<span class="text-xs text-muted text-ellipsis">{{ item.subName }}</span>
						</div>
					</div>
					<div class="flex items-center desc">
						<span class="text-xs text-muted flex items-center">
							<span class="text-nowrap px-2">{{ item.desc }}</span>
							<component :is="item.descIcon" v-if="item.descIcon" class="ml-1 w-4" />
							<template v-if="item.badge">
								<div class="text-xs rounded-full bg-red text-white px-1 h-4 min-w-4 flex items-center leading-normal justify-center">{{ item.badge > 99 ? '99+' : item.badge }}</div>
							</template>
						</span>
						<el-icon v-if="item.more == undefined" class="ml-2 text-muted">
							<ArrowRight />
						</el-icon>
						<el-icon v-else-if="typeof item.more != 'boolean'" class="ml-2 text-muted">
							<component :is="item.more" />
						</el-icon>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
<style lang="less" scoped>
	@media (max-width: 999px) {
		.menu-list {
			ul {
				li {
					&:hover {
						background-color: transparent;
					}
					transition: background-color 0.2s ease;
					user-select: none;
					-webkit-tap-highlight-color: transparent;
					&:active {
						background-color: var(--transparent05);
					}
				}
			}

			&.large {
				ul {
					li {
						.icon {
							svg {
								@apply w-8 h-8;
							}
						}
						@apply py-4;
					}
				}
			}
		}
	}
</style>
