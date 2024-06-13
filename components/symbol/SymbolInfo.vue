<template>
    <div class="symbol-info flex items-center text-ms ml-3 mr-1 px-2 rounded-md cursor-pointer bg-[--transparent05] hover:bg-[--transparent10]">
        <img src="https://www.okx.com/cdn/oksupport/asset/currency/icon/eth.png" width="20px" class="mr-1"/>
        <b>BTCUSD</b>
        <el-icon class="ml-1"><ArrowDown /></el-icon>
    </div>
</template>
<style lang="less" scoped>
.symbol-info {
    height: 30px;
    button{
        @apply border rounded py-1 px-2;
    }
}
</style>