<script lang="ts" setup>
const props = defineProps<{
    exchange:string
}>()
</script>
<template>
    <div class="bg-[--transparent10] rounded-full overflow-hidden">
        <BinanceIcon v-if="exchange=='binance'"/>
        <OKXIcon v-if="exchange=='okx'"/>
        <CoinBaseIcon  v-if="exchange=='coinbase'" class="bg-white"/>
    </div>
</template>