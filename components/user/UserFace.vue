<script setup lang="ts">
import { useAvatar } from '~/composable/useAvatar';

onBeforeUnmount(() => {
    // Cleanup or additional logic if needed
    console.log('UserFace component is being destroyed');
});
</script>

<template>
    <div class="face-container w-full h-auto flex items-center justify-center">
        <div class="face-content flex items-center justify-center flex-col p-4">
            <div class="face-icon flex items-center justify-center">
                <img :src="useAvatar()" alt="Face Icon" class="w-16 h-16 rounded-full" />
            </div>
            <div class="face-text mt-4 text-center text-main text-lg font-semibold">
                new hans
            </div>
            <div class="face-button mt-1 text-muted text-sm">
                
                93444****@qq.com
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped></style>
