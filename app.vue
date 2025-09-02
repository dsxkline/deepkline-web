<script setup lang="ts">
	import { useRefreshChildEvent } from './composable/usePush'
	const isStartup = ref(false)
	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<StartupImages />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
