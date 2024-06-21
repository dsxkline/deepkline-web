<script lang="ts" setup>
	import { useNuxtApp } from "#app";
	import OKXWebSocket from "@/fetch/okx/okx.websocket";
	onMounted(async () => {
		console.log("server", process.server);
		const ws = new OKXWebSocket()
		ws.connect();
		ws.subTickers(['BTC-USDT-SWAP','ETH-USD-SWAP'], (data,error) => {
			console.log(data,error);
		}
);
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