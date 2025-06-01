<script setup lang="ts">
import { ArrowLeftBold } from '@element-plus/icons-vue';
const props = defineProps<{
    title?:string,
    hideBack?:boolean
}>()
const slots = useSlots()

let returnBack = ()=>{
    useNuxtApp().$pop()
}
onMounted(() => {
    // 初始化工作
    console.log('NavigationBar component mounted');
    // setTimeout(() => {
    //     useNuxtApp().$pop()
    // }, 3000);
})
onBeforeUnmount(() => {

    // 清理工作
    console.log('NavigationBar component is being destroyed');
})
</script>
<template>
    <div class="navbar flex items-center w-full h-[--nav-height] relative justify-between">
        <div class="navbar-left flex items-center h-full">
            <button v-if="!slots.left && !hideBack" class="flex items-center px-3 h-full" @click="returnBack"><el-icon><ArrowLeftBold /></el-icon></button>
            <div class="flex items-center px-3 h-full"><slot name="left"/></div>
        </div>
        <div class="navbar-title absolute top-0 left-[20%] w-3/5 h-full px-2 flex items-center justify-center" v-if="title || slots.title">
            <b v-if="!slots.title" class="text-lg font-bold">{{ title }}</b>
            <slot name="title" />
        </div>
        <div class="navbar-right px-3 h-full flex items-center">
            <slot name="right" />
        </div>
    </div>
</template>