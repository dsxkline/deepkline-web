<script lang="js" setup>
import SymbolSearch from './SymbolSearch.vue';
const nuxtApp = useNuxtApp()
function pushSearch(){
    console.log(nuxtApp)
    nuxtApp.$pushLeft(SymbolSearch,{},"460px")
}
</script>
<template>
    <div class="symbol-title flex items-center text-ms px-2 rounded-md cursor-pointer" @click="pushSearch">
        <img src="https://www.okx.com/cdn/oksupport/asset/currency/icon/eth.png" width="20px" class="mr-1"/>
        <b>BTCUSD</b>
        <el-icon class="ml-1"><ArrowDown /></el-icon>
    </div>
</template>
<style lang="less" scoped>
.symbol-title {
    height: 30px;
    button{
        @apply border rounded py-1 px-2;
    }
}
</style>

