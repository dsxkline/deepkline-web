<script setup lang="ts">
	import { useStore } from "~/store";
	
	const store = useStore();
	store.increment();
</script>
<template>
	<div class="header border-b border-[--border-color] w-full">
		<p>
			<ThemeSwitch></ThemeSwitch>
		</p>
	</div>
</template>

<style lang="less" scoped>
	.header {
		height: var(--header-height);
	}
</style>
