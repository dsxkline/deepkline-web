<script setup lang="ts">
import { usePush, usePushUp } from '~/composable/usePush';
import ExchangeIndex from '~/pages/exchange/index.vue';
import Login from '~/pages/login/index.vue';
import { useUserStore } from '~/store/user';
const props = defineProps<{
	hideButtons?:boolean
	title?:string
	desc?:string
}>();
const pushUp = usePushUp()
const clickHandle = ()=>{
    if(!useUserStore()?.user?.id){
        pushUp(Login)
    }
}
const usepush = usePush()
const pushAddAccount = ()=>{
	usepush(ExchangeIndex)
}
onBeforeUnmount(() => {
    // Cleanup or additional logic if needed
    console.log('UserFace component is being destroyed');
});
</script>

<template>
	<div>
		<h1 class="px-4 text-2xl font-bold py-5 flex justify-between items-center" ref="exchangeHeader">
			<div>
				{{ title }}
				<p class="text-sm font-normal text-grey py-2" v-if="desc">{{ desc }}</p>
			</div>

			<div class="w-20 h-20 relative">
				<ExchangeBannerIcon class="absolute right-[-30%] top-[-30%] w-32" />
			</div>
		</h1>
		<div class="flex items-center justify-between px-4 gap-3 mb-4" v-if="!useUserStore().user">
			<button class="bt-default flex-1 !py-2 !text-sm !border-0 glass overflow-hidden" @click="clickHandle">开设账户</button>
			<button class="bt-brand flex-1 !py-2 !text-sm !border-0" @click="clickHandle">登录/注册</button>
		</div>
		<div class="flex items-center px-4 gap-3 mb-4" v-else-if="!hideButtons">
			<button class="bt-brand !py-2 !text-sm !border-0 !w-max !px-7" @click="pushAddAccount">开设账户</button>
		</div>
	</div>
</template>
