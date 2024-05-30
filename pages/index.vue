<script lang="ts" setup>
	import { useNuxtApp } from "#app";
	onMounted(async () => {
		console.log("server", process.server);
	});
</script>
<template>
	<div class="main-container flex flex-row justify-between">
		<LeftMenu></LeftMenu>
		<SplitContainer>
			<template #right>
				<KlineChart></KlineChart>
			</template>
		</SplitContainer>
	</div>
</template>

<style></style>