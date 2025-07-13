<script setup lang="ts">
	import { useStore } from '~/store'
	const isStartup = ref(false)
</script>
<template>
	<!-- <StartupImages v-model="isStartup" /> -->
	<div class="app-container flex flex-col justify-between w-full h-full">
		<Header />
		<slot v-if="!useStore().unload" />
		<StatusBar v-if="!useStore().unload" />
	</div>
</template>

<style lang="less" scoped>
	@media (max-width: 999px) {
		.app-container {
			.header {
				display: none;
			}
			.status-bar {
				display: none;
			}
		}
	}
</style>
