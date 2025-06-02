<script setup lang="ts">
import { usePush } from '~/composable/usePush';
import Captcha from './captcha.vue';

const email = ref('')
const usepush = usePush()
const next = ()=>{
    usepush(Captcha,{email:email})
}
</script>
<template>
	<div class="register-container">
		<div class="global-form p-6">
			<div class="form-item my-4">
				<!-- <label>邮箱登录:</label> -->
				<el-input v-model="email" :placeholder="'请输入邮箱 例如: 123@gmail.com'" size="large"/>
			</div>

			<div class="form-item mt-8">
				<button :class="['w-full transition-all !py-3 !text-sm bt-default',email.indexOf('@')>=0?'!bg-brand':' !text-grey !bg-[--transparent01] !border-[--transparent01]']" @click="next">下一步</button>
			</div>

			
		</div>
	</div>
</template>

<style lang="less" scoped>
	
</style>
