<script setup lang="ts">
import type { SymbolDto } from '~/fetch/dtos/symbol.dto';
import { InstanceType, type Ticker } from '~/fetch/okx/okx.type.d'
const props = defineProps<{
    symbol: SymbolDto,
    price?:string
}>()
const emit = defineEmits<{
    (event:'update:price',value:string):void
}>()
const { $wsb, $ws } = useNuxtApp()
const ticker = ref($ws.getTickers(props.symbol.symbol))
const tickerHandler = (data: Ticker) => {
    // console.log('tickerHandler',props.symbol.instId,data)
    ticker.value = data
    emit('update:price',props.symbol.symbol+"@"+data.last)
}

onMounted(() => {
    $ws.addTickerHandler(props.symbol.symbol,tickerHandler)
})

onUnmounted(() => {
    $ws.removeTickerHandler(props.symbol.symbol,tickerHandler)
})
</script>
<template>
    <div class="text-sm">
        <b v-if="!ticker?.last">-</b>
        <b v-else>{{ formatPrice(ticker.last,props.symbol.tickSz)}}</b>
    </div>
</template>