<script setup lang="ts">
import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    symbol: Instruments
}>()
const price = computed(()=>useSymbolStore().tickets[props?.symbol?.instId])
const changeRate = computed(()=>{
    return price.value?.last&&price.value?.sodUtc8?(parseFloat(price.value?.last)-parseFloat(price.value?.sodUtc8))/parseFloat(price.value?.sodUtc8)*100:0
})
</script>
<template>
    <div class="*:text-white *:px-2 *:w-[70px] *:h-[25px] *:rounded *:text-xs">
        <button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate">-</button>
        <button :class="{'bg-[rgb(var(--color-green))]':changeRate>0,'bg-[rgb(var(--color-red))]':changeRate<0}" v-else>{{formatChangeRate(changeRate,2)}}%</button>
    </div>
</template>