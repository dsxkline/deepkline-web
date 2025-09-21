<script setup lang="ts">
import { CaretTop,CaretBottom } from "@element-plus/icons-vue";
const props = defineProps({
    modelValue:{
        type:Number,
        default:0
    }
})
const emit = defineEmits<{
    (event:"update:modelValue",value:number):void,
    (event:"onChange",value:number):void
}>()
const active = ref(0)
const clickHandle = ()=>{
    active.value ++
    if(active.value>=3) active.value = 0
    emit('update:modelValue',active.value)
    //console.log('update:modelValue',active.value)
    emit('onChange',active.value)
    useNuxtApp().$clickSound()
}
const reset = ()=>{
    active.value = 0
   // console.log('reset',active.value)
}

onMounted(()=>{
    active.value = props.modelValue
})
defineExpose({
    clickHandle,
    reset
});
</script>
<template>
  <div class="flex flex-col *:text-grey *:leading-[6px] *:text-[16px]">
    <span :class="{'flex':true,'!text-main':active==1}">
        <el-icon class="!text-[10px] leading-[6px] !h-[6px]"><CaretTop /></el-icon>
    </span>
    <span :class="{'flex':true,'!text-main':active==2}"> 
        <el-icon class="!text-[10px] leading-[6px] !h-[6px]"><CaretBottom /></el-icon>
    </span>

  </div>
</template>
