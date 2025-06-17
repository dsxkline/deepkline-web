<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments,
    price?:string
}>()
const emit = defineEmits<{
    (event:'update:price',value:string):void
}>()
const { $wsb, $ws } = useNuxtApp()
const ticker = ref($ws.getTickers(props.symbol.instId))
const tickerHandler = (data: Ticker) => {
    // console.log('tickerHandler',props.symbol.instId,data)
    ticker.value = data
    emit('update:price',props.symbol.instId+"@"+data.last)
}

onMounted(() => {
    $ws.addTickerHandler(props.symbol.instId,tickerHandler)
})

onUnmounted(() => {
    $ws.removeTickerHandler(props.symbol.instId,tickerHandler)
})
</script>
<template>
    <div class="text-sm">
        <b v-if="!ticker?.last">-</b>
        <b v-else>{{ formatPrice(ticker.last,props.symbol.tickSz)}}</b>
    </div>
</template>