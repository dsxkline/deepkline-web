<script setup lang="ts">
	import { useStore } from "~/store";
	const colorMode = useColorMode();
	const store = useStore();
	store.increment();
</script>
<template>
	<div class="header">
		<p class="p-4 pb-2">
			<select
				v-model="colorMode.preference"
				class="border w-24 h-8 dark:bg-gray-900 dark:text-white dark:border-gray-700">
				<option value="system-theme">System{{ store.count }}</option>
				<option value="light-theme">Light</option>
				<option value="dark-theme">Dark</option>
			</select>
		</p>
	</div>
</template>

<style lang="less" scoped>
	.header {
		width: 100%;
		height: 40px;
	}
</style>
