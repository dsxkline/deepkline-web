<script setup lang="ts">
import { useSymbolStore } from '~/store/symbol';
const props = defineProps<{
    height: number,
    symbol: string
}>()
const loading = ref(true)
const error = ref('')
const contentHeight = computed(() => {
    // 获取当前组件的高度
    return props.height || 10000
})
const symbolObj = computed(() => useSymbolStore().getActiveSymbol())
function getTradeorders(){

}
</script>
<template>
    <div>
        <div class="w-full h-full">
            <el-scrollbar :height="contentHeight + 'px'">
                <div class="px-3">
                    <TradeOrderForm></TradeOrderForm>
                    <TradeOrderList></TradeOrderList>
                </div>
            </el-scrollbar>
        </div>
        <el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
            <template #extra>
                <el-button @click.stop="getTradeorders()">点击刷新</el-button>
            </template>
        </el-result>
        <el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
    </div>
</template>