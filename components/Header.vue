<script setup lang="ts">
	import { useStore } from "~/store";
	
	// const store = useStore();
	// store.increment();
</script>
<template>
	<div class="header border-b border-[--border-color] w-full flex items-center">
		<SymbolTitle></SymbolTitle>
		<SymbolTools></SymbolTools>
		<ThemeSwitch></ThemeSwitch>
		
	</div>
</template>

<style lang="less" scoped>
	.header {
		height: var(--header-height);
		background-color: var(--transparent05);
	}
</style>
