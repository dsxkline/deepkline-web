<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const { $wsb, $ws } = useNuxtApp()
const price = ref($ws.getTickers(props.symbol.instId))
const tickerHandler = (data: Ticker) => {
    price.value = data
}

onMounted(() => {
    $ws.addTickerHandler(props.symbol.instId,tickerHandler)
})

onUnmounted(() => {
    $ws.removeTickerHandler(props.symbol.instId,tickerHandler)
})
</script>
<template>
    <div>
        <b class="text-sm" v-if="!price?.last">-</b>
        <b class="text-sm" v-else>{{ formatPrice(price.last,props.symbol.tickSz)}}</b>
    </div>
</template>