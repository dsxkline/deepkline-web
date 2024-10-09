<template>
    <div class="app-container">
        <Header></Header>
        <button @click="onCleanMicroApps">卸载子应用缓存</button>
        <div id="qiankun-content"></div> 
        <slot />
        <StatusBar></StatusBar>
    </div>
</template>

<script setup lang="ts">
import { cleanMicroApps } from "@/store/qiankun";
const onCleanMicroApps = () => {
  cleanMicroApps();
  navigateTo("/");
};
</script>