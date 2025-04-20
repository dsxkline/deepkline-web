<script lang="ts" setup>
	import { ref } from "vue";
	import { useStore } from "~/store";
	import type { MenuModel } from "./common/TabBar.vue";
	const props = defineProps<{
		menus: MenuModel[],
		active?:number
	}>();

	const menuActive = ref(props.active||0)

	const emit = defineEmits<{
		(event:"update:active",value:number):void,
		(event:'menuHandler',menu:MenuModel,index:number):void
	}>()

	const handleOpen = (menu: MenuModel, index: number) => {
		console.log('handleOpen',menu,index)
		menuActive.value = index
		emit('update:active',index)
		emit('menuHandler',menu,index);
	};

</script>

<template>
	<div class="left-menu flex flex-col justify-between border-r border-[--border-color] bg-[--transparent05]">
		<div>
			<ul class="w-[var(--menu-width)] *:flex *:items-center *:justify-center *:py-3 *:flex-col *:text-xs *:cursor-pointer *:text-muted">
				<li :class="menuActive==index?'bg-[var(--transparent05)] !text-main':'hover:bg-[var(--transparent02)]'+''" v-for="(menu,index) in props.menus" :key="menu.name" click-sound @click="handleOpen(menu,index)">
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
