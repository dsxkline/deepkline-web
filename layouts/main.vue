<script setup lang="ts">
	import { useStore } from '~/store'
</script>
<template>
    <div class="app-container flex flex-col justify-between w-full h-full">
        <Header/>
        <slot v-if="!useStore().unload"/>
        <StatusBar v-if="!useStore().unload"/>
    </div>
</template>

