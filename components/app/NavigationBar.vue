<script setup lang="ts">
import { ArrowLeftBold } from '@element-plus/icons-vue';
import { usePop } from '~/composable/usePush';
const props = defineProps<{
    title?:string,
    hideBack?:boolean
}>()
const slots = useSlots()
const pop = usePop()
function returnBack(){
    pop()
}
</script>
<template>
    <div class="navbar flex items-center w-full h-[--nav-height] relative justify-between">
        <div class="navbar-left flex items-center">
            <button v-if="!slots.left && !hideBack" class="flex items-center px-3" @click="returnBack"><el-icon><ArrowLeftBold /></el-icon></button>
            <div class="flex items-center px-3"><slot name="left"/></div>
        </div>
        <div class="navbar-title absolute top-0 left-[20%] w-3/5 h-full px-2 flex items-center justify-center">
            <b v-if="!slots.title" class="text-lg font-bold">{{ title }}</b>
            <slot name="title" />
        </div>
        <div class="navbar-right px-3">
            <slot name="right" />
        </div>
    </div>
</template>