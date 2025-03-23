<script setup lang="ts">

const props = defineProps({
    title:{
        type:String,
        default:''
    }
})
</script>
<template>
    <div>
        自选
        {{ title }}
    </div>
</template>