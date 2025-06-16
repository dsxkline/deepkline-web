<script setup lang="ts">
import { useRefreshChildEvent } from './composable/usePush';

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
