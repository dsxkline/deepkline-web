<script lang="ts" setup>
	import { useNuxtApp } from '#app'
	import OKXWebSocket from '@/fetch/okx/okx.websocket'
	import { CandleCannel } from '@/fetch/okx/okx.type.d'
	// 使用默认布局
	definePageMeta({
		layout: 'main'
	})
	onMounted(async () => {
		console.log('server', process.server)
	})
</script>
<template>
	<div class="main-container flex justify-between flex-row">
		<LeftMenu></LeftMenu>
		<SplitContainer>
			<template #left>
				<SymbolMarketDatas :symbol="'BTC-USDT-SWAP'"></SymbolMarketDatas>
			</template>
			<template #right>
				<SplitRowContainer>
					<template #up>
						<Footer />
					</template>
					<template #down>
						<KlineChart></KlineChart>
					</template>
				</SplitRowContainer>
			</template>
		</SplitContainer>
	</div>
</template>

<style></style>
