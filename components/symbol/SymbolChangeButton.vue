<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const price = ref<Ticker>(useSymbolStore().tickets[props?.symbol?.instId])
const changeRate = computed(()=>{
    return price.value?.last&&price.value?.sodUtc8?(parseFloat(price.value?.last)-parseFloat(price.value?.sodUtc8))/parseFloat(price.value?.sodUtc8)*100:0
})
watch(()=>useSymbolStore().tickets[props?.symbol?.instId],(val)=>{
    price.value = val
    // console.log('symbol price',props?.symbol?.instId,val)
},{
    deep:true
})

onMounted(()=>{
    price.value = useSymbolStore().tickets[props?.symbol?.instId]
    // console.log('symbol price',props?.symbol?.instId,price.value,JSON.stringify(useSymbolStore().tickets))
})
</script>
<template>
    <div class="*:text-white *:px-2 *:w-[90px] *:h-[30px] *:rounded *:text-sm">
        <button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate">-</button>
        <button :class="{'bg-[rgb(var(--color-green))]':changeRate>0,'bg-[rgb(var(--color-red))]':changeRate<0}" v-else>{{formatChangeRate(changeRate,2)}}%</button>
    </div>
</template>