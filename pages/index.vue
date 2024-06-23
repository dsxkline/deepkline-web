<script lang="ts" setup>
import { useNuxtApp } from "#app";
import OKXWebSocket from "@/fetch/okx/okx.websocket";
import { CandleCannel} from "@/fetch/okx/okx.type.d";
onMounted(async () => {
	console.log("server", process.server);
	const ws = new OKXWebSocket()
	ws.connect();

	const wsb = OKXWebSocket.createBusiness()
	wsb.connect();
	ws.subTickers(['BTC-USDT-SWAP','ETH-USD-SWAP'], (message, error) => {
		console.log("ddddd:",message, error);
	});
	// ws.subTickers(['BTC-USDT-SWAP'], (data, error) => {
	// 	console.log("BTC-USDT-SWAP",data, error);
	// });
	// ws.subTickers(['ETH-USD-SWAP'], (data, error) => {
	// 	console.log("ETH-USD-SWAP",data, error);
	// });

	wsb.subCandle(CandleCannel.candle1D,['BTC-USDT'], (message, error) => {
		console.log("candle3M",message.data, error);
		if(message.data) message.data.forEach(([ts,o,h,l,c]) => {
			console.log("candle3M",ts,o,h,l,c, error);
		})
	})
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