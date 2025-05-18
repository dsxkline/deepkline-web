<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const { $wsb, $ws } = useNuxtApp()
const ticker = $ws.getTickers(props.symbol.instId)
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
        <img :src="props.symbol?.icon" class="w-[20px] px-2" v-if="props.symbol?.icon" />
        <!-- 现货 -->
        <div class="flex flex-col items-start" v-if="props.symbol?.instType === InstanceType.SPOT">
            <div class="flex items-center"><b class="text-base text-main">{{props.symbol?.baseCcy}}</b><span class="text-xs text-grey px-1"> / </span><span class="text-xs text-grey">{{props.symbol?.quoteCcy}}</span>
                <!-- <button class="text-[10px] ml-1 bg-[--transparent10] px-1 rounded text-muted">10x</button> -->
            </div>
            <span class="text-xs text-grey font-light">{{ moneyFormat(price,"$")||'-' }}</span>
        </div>
        <!-- 合约 -->
        <div class="flex flex-col items-start" v-else-if="props.symbol?.instType === InstanceType.SWAP">
            <div class="flex items-center"><b class="text-base text-main">{{props.symbol?.ctValCcy}}{{props.symbol.settleCcy}}</b>
                <!-- <button class="text-[10px] ml-1 bg-[--transparent10] px-1 rounded text-muted">10x</button> -->
            </div>
            <span class="text-xs text-grey font-light">{{ moneyFormat(price,"$")||'-' }}</span>
        </div>
    </div>
</template>