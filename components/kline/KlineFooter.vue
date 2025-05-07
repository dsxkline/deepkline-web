<script lang="ts" setup>
import { useSymbolStore } from '~/store/symbol';
import type { Instruments } from '~/fetch/okx/okx.type.d';
const props = defineProps<{
    symbol: string
}>()

</script>
<template>
    <div class="kline-header h-[var(--footer-height)] border-[var(--transparent05)] bg-[--transparent05] border-t w-full flex items-center">
        <Indicator :symbol="symbol" />
    </div>
</template>
<style lang="less" scoped>

</style>