<script setup lang="ts">
	import { useRefreshChildEvent } from './composable/usePush'
	const isStartup = ref(false)
	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<StartupImages v-model="isStartup" />
	<template v-if="isStartup">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</template>
</template>
