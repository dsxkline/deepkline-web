<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
const props = defineProps<{
    symbol: Instruments
    volume?: boolean
}>()
const { $wsb, $ws } = useNuxtApp()
const ticker = $ws?.getTickers(props.symbol.instId)
const price = ref(parseFloat(ticker?.last||'0')*parseFloat(ticker?.vol24h||"0"))
const tickerHandler = (data: Ticker) => {
    price.value = parseFloat(data?.last||'0')*parseFloat(data?.vol24h||"0")
}
onMounted(() => {
    $ws.addTickerHandler(props.symbol.instId,tickerHandler)
})
onUnmounted(() => {
    $ws.removeTickerHandler(props.symbol.instId,tickerHandler)
})

</script>
<template>
    <div class="flex items-center">
        <img :src="symbol?.icon" class="w-[20px] px-2" v-if="symbol?.icon" />
        <!-- 现货 -->
        <div class="flex flex-col items-start" v-if="symbol?.instType === InstanceType.SPOT">
            <div class="flex items-center"><b class="text-main">{{symbol?.baseCcy}}</b><span class="text-grey px-[2px] scale-90"> / </span><span class="text-grey scale-90">{{props.symbol?.quoteCcy}}</span>
                <!-- <button class="text-[10px] ml-1 bg-[--transparent10] px-1 rounded text-muted">10x</button> -->
            </div>
            <span class="text-xs text-grey font-light" v-if="volume">{{ moneyFormat(price,"$")||'-' }}</span>
        </div>
        <!-- 合约 -->
        <div class="flex flex-col items-start" v-else-if="symbol?.instType === InstanceType.SWAP">
            <div class="flex items-center"><b class="text-main">{{symbol?.ctValCcy}}{{symbol.settleCcy}}</b>
                <!-- <button class="text-[10px] ml-1 bg-[--transparent10] px-1 rounded text-muted">10x</button> -->
            </div>
            <span class="text-xs text-grey font-light" v-if="volume">{{ moneyFormat(price,"$")||'-' }}</span>
        </div>
    </div>
</template>