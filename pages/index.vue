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
			<template #left>
				<KlineChart></KlineChart>
			</template>
			<template #right>
				<SymbolMarketDatas></SymbolMarketDatas>
			</template>
		</SplitContainer>
	</div>
</template>

<style></style>