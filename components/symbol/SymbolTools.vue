<template>
    <div class="symbol-tools flex items-center text-ms">
        <button><el-icon><Reading /></el-icon></button>
        <button><el-icon><Star /></el-icon></button>
        
    </div>
</template>
<style lang="less" scoped>
.symbol-tools {
    
    button{
        height: 30px;
        background-color: var(--transparent05);
        @apply px-2 rounded-md cursor-pointer mx-1 flex items-center justify-center;
        &:hover{
            background-color: var(--transparent10);
        }
    }
}
</style>