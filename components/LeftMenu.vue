<script lang="ts" setup>
	import { ref } from "vue";
	import { useStore } from "~/store";
	import type { MenuModel } from "./common/TabBar.vue";
	const props = defineProps<{
		menus: MenuModel[],
		active?:number
	}>();
	const fn = async () => {
		// ComposFetch.commonFetch.getCommon().then((res) => {
		// 	// console.log(data.value,typeof(data.value),data.value?.name);
		// });
	};
	const isCollapse = ref(true);
	const handleOpen = (menu: MenuModel, index: number) => {
		// console.log(key, keyPath);
		fn();
		useStore().setSplitLeft(!useStore().hideSplitLeft)
	};
	const handleClose = (key: string, keyPath: string[]) => {
		// console.log(key, keyPath);
	};
</script>

<template>
	<div class="left-menu flex flex-col justify-between border-r border-[--border-color] bg-[--transparent05]">
		<div>
			<ul class="w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted">
				<li :class="(active||0)==index?'bg-[var(--transparent05)] !text-main':'hover:bg-[var(--transparent02)]'+''" v-for="(menu,index) in props.menus" :key="menu.name" @click="handleOpen(menu,index)">
					<component :is="menu.icon" class="w-5" v-if="menu.icon" />
					<span v-if="menu.name" class="py-2">{{ menu.name }}</span>
				</li>
			</ul>
		</div>
		<div>
			<ul class="w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xls *:cursor-pointer *:text-muted">
				<li>
					<el-icon class="!w-[20px] !h-[20px] text-muted :hover:text-main"><Setting class="!w-[20px] !h-[20px]" /></el-icon>
				</li>
			</ul>
		</div>
	</div>
</template>
<style>

</style>
