<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const price = computed(()=>useSymbolStore().tickets[props?.symbol?.instId])

</script>
<template>
    <div>
        <b class="text-sm" v-if="!price?.last">-</b>
        <b class="text-sm" v-else>{{ formatPrice(price.last,props.symbol.tickSz)}}</b>
    </div>
</template>