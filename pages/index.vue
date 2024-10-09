<script lang="ts" setup>
import { useNuxtApp } from "#app";
import OKXWebSocket from "@/fetch/okx/okx.websocket";
import { CandleCannel} from "@/fetch/okx/okx.type.d";
onMounted(async () => {
	console.log("server", process.server);
	
});

</script>
<template>
	<div class="main-container flex justify-between flex-row-reverse">
		<LeftMenu></LeftMenu>
		<SplitContainer>
			<template #left>
				<SplitRowContainer>
					<template #up>
						<KlineChart></KlineChart>
					</template>
					<template #down>
						<Footer />
					</template>
				</SplitRowContainer>
			</template>
			<template #right>
				<SymbolMarketDatas :symbol="'BTC-USDT-SWAP'"></SymbolMarketDatas>
			</template>
		</SplitContainer>
	</div>
</template>

<style></style>