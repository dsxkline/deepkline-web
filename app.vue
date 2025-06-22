<script setup lang="ts">
	import { useRefreshChildEvent } from './composable/usePush'
	const isStartup = ref(false)
	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<template v-if="isStartup">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</template>

	<StartupImages v-else v-model="isStartup" />
</template>
