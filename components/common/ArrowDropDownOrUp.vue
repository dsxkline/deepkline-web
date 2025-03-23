<script setup lang="ts">

const props = defineProps({
    modelValue:{
        type:Number,
        default:0
    }
})
const emit = defineEmits<{
    (event:"update:modelValue",value:number):void
}>()
const active = ref(0)
const clickHandle = ()=>{
    active.value ++
    if(active.value>=3) active.value = 0
    emit('update:modelValue',active.value)
}
onMounted(()=>{
    active.value = props.modelValue
})
</script>
<template>
  <div @click.stop="clickHandle" class="flex flex-col *:text-muted *:leading-[6px] *:text-[16px]">
    <span :class="{'material-icons':true,'text-main':active==1}"> arrow_drop_up </span>
    <span :class="{'material-icons':true,'text-main':active==2}"> arrow_drop_down </span>
  </div>
</template>
