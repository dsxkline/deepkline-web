<script setup lang="ts">
import { useAvatar } from '~/composable/useAvatar';
import { usePush, usePushUp } from '~/composable/usePush';
import Login from '~/pages/login/index.vue';
import Avatar from '~/pages/me/avatar.vue';
import { useUserStore } from '~/store/user';
import defaultAvatar from '~/assets/images/default-avatar.svg'
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
const imageOnError = (event: Event) => {
		if (event.target) (event.target as HTMLImageElement).src = defaultAvatar
	}
onBeforeUnmount(() => {
    // Cleanup or additional logic if needed
    console.log('UserFace component is being destroyed');
});
</script>

<template>
	<div class="pb-4">
		<h1 class="px-4 text-2xl font-bold py-5 flex justify-between items-center" ref="exchangeHeader">
			<div>
				连接全球顶尖经纪商
				<p class="text-sm font-normal text-grey py-2">实战才是检验真理的唯一标准</p>
			</div>

			<div class="w-20 h-20 relative">
				<ExchangeBannerIcon class="absolute right-[-30%] top-[-30%] w-32" />
			</div>
		</h1>
		<div class="flex items-center justify-between px-4 gap-3">
			<button class="bt-default flex-1 !py-2 !text-sm" @click="clickHandle">注册</button>
			<button class="bt-brand flex-1 !py-2 !text-sm" @click="clickHandle">登录</button>
		</div>
	</div>
</template>
