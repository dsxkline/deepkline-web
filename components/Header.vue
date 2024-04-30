<script setup lang="ts">
	import { useStore } from "~/store";
	const colorMode = useColorMode();
	const store = useStore();
	store.increment();
</script>
<template>
	<div class="header border-b border-[--border-color]">
		<p class="p-4 pb-2">
			<select
				v-model="colorMode.preference"
				class="border w-24 h-8 dark:bg-gray-900 dark:text-white dark:border-gray-700">
				<option value="system">System{{ store.count }}</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</p>
	</div>
</template>

<style lang="less" scoped>
	.header {
		width: 100%;
		height: var(--header-height);
	}
</style>
