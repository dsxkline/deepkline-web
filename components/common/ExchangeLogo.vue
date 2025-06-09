<script lang="ts" setup>
const props = defineProps<{
    exchange:string
}>()
</script>
<template>
    <div class="bg-[--transparent10] h-10 w-10 rounded-full overflow-hidden">
        <BinanceIcon v-if="exchange=='binance'" class="h-10"/>
        <OKXIcon v-if="exchange=='okx'" class="h-10"/>
        <CoinBaseIcon  v-if="exchange=='coinbase'" class="h-10"/>
    </div>
</template>