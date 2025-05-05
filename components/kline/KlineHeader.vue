<script lang="ts" setup>
import { useSymbolStore } from '~/store/symbol';
import type { Instruments } from '~/fetch/okx/okx.type.d';
const props = defineProps<{
    symbol: Instruments
}>()

</script>
<template>
    <div class="kline-header px-1 pl-6 h-[var(--footer-height)] border-[var(--transparent05)] bg-[--transparent05] border-b w-full flex items-center">
        
        <SymbolTitle :symbol="symbol" />
        <SymbolTools  :symbol="symbol"/>
        <el-divider direction="vertical"></el-divider>
        <CycleBar  :symbol="symbol"/>
    </div>
</template>
<style lang="less" scoped>

</style>