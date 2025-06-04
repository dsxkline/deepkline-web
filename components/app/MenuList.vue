<script setup lang="ts">
	interface MenuListModel {
		id: number
		name: string
		subName?: string // 子菜单名称
		icon?: any
		desc?: string
		descIcon?: any // 描述图标
		more?: any
		hide?: boolean
		callback?: () => void // 点击回调
	}
	const props = defineProps<{
		menus: MenuListModel[]
	}>()

	onBeforeUnmount(() => {
		// 清理工作
		console.log('MenuList component is being destroyed')
	})
</script>
<template>
	<div class="menu-list w-full h-full flex flex-col" v-if="menus && menus.length > 0">
		<ul>
			<template  v-for="(item, index) in menus">
				<li :key="index" v-if="!item.hide" class="flex justify-between items-center p-3 hover:bg-[var(--transparent05)] cursor-pointer" @click="item.callback">
					<div class="flex items-center">
						<component :is="item.icon" class="w-5 h-5 mr-2" v-if="item.icon"></component>
						<div class="flex flex-col">
							<span class="text-base">{{ item.name }}</span>
							<span class="text-xs text-muted">{{ item.subName }}</span>
						</div>
					</div>
					<div class="flex items-center">
						<span class="text-xs text-muted flex items-center">
							{{ item.desc }}
							<component :is="item.descIcon" v-if="item.descIcon" class="ml-1 w-4" />
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
		}
	}
</style>
