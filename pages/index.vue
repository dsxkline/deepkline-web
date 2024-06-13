<script lang="ts" setup>
	import { useNuxtApp } from "#app";
	onMounted(async () => {
		console.log("server", process.server);
	});
</script>
<template>
	<div class="main-container flex justify-between flex-row-reverse">
		<LeftMenu></LeftMenu>
		<SplitContainer>
			<template #right>
				<KlineChart></KlineChart>
			</template>
		</SplitContainer>
	</div>
</template>

<style></style>