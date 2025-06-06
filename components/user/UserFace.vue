<script setup lang="ts">
import { useAvatar } from '~/composable/useAvatar';
import { usePush, usePushUp } from '~/composable/usePush';
import Login from '~/pages/login/index.vue';
import Avatar from '~/pages/me/avatar.vue';
import { useUserStore } from '~/store/user';
const pushUp = usePushUp()
const clickHandle = ()=>{
    if(!useUserStore()?.user?.id){
        pushUp(Login)
    }
}
const usepush = usePush()
function pushAvatar(){
		usepush(Avatar)
	}

onBeforeUnmount(() => {
    // Cleanup or additional logic if needed
    console.log('UserFace component is being destroyed');
});
</script>

<template>
    <div class="face-container w-full h-auto flex items-center justify-center">
        <div class="face-content flex items-center justify-center flex-col p-4" @click="clickHandle">
            <div class="face-icon flex items-center justify-center relative">
                <img :src="(useUserStore()?.user?.face || useAvatar())" alt="Face Icon" class="w-16 h-16 rounded-full bg-[--transparent05]" @click.stop="pushAvatar" v-if="useUserStore()?.user?.id"/>
                <img src="~/assets/images/logo.png" alt="Face Icon" class="w-16 h-16 rounded-full" v-else/>
                <button class="absolute bottom-0 right-0" @click.stop="pushAvatar" v-if="useUserStore()?.user?.id"><el-icon><Edit/></el-icon></button>
            </div>
            <div class="face-text mt-4 text-center text-main text-lg font-semibold">
                {{ useUserStore()?.user?.nickName || '登录/注册' }}
            </div>
            <div class="face-button mt-1 text-muted text-sm">
                {{ useUserStore()?.user?.email || '注册即送$500体验金' }}
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped></style>
