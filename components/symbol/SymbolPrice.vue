<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const price = ref<Ticker>(useSymbolStore().tickets[props?.symbol?.instId])
watch(()=>useSymbolStore().tickets[props?.symbol?.instId],(val)=>{
    price.value = val
    // console.log('symbol price',props?.symbol?.instId,val)
},{
    deep:true
})
// watchEffect(() => {
// 	price.value = useSymbolStore().tickets[props?.symbol?.instId]
//     console.log('symbol price',props?.symbol?.instId,price.value)
// })
onMounted(()=>{
    price.value = useSymbolStore().tickets[props?.symbol?.instId]
    // console.log('symbol price',props?.symbol?.instId,price.value,JSON.stringify(useSymbolStore().tickets))
})
</script>
<template>
    <div>
        <b class="text-sm" v-if="!price?.last">-</b>
        <b class="text-sm" v-else>{{ formatPrice(price.last,props.symbol.tickSz)}}</b>
    </div>
</template>