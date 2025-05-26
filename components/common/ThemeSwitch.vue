<script setup lang="ts">
	import {useStore} from '~/store'
	import clearPWACaches from '~/composable/clearPWACaches'
    let colorCookie = useCookie('nuxt-color-mode',{default:()=>"dark"});
	const theme = ref("dark" !== useStore().theme);
	watch(
		() => theme.value,
		(val) => {
			colorCookie.value = theme.value ? 'light' : 'dark';
			changeTheme();
		}
	);

	function changeTheme(){
		// console.log('changeTheme', theme.value);
		// colorMode.preference = theme.value ? 'light' : 'dark'
		colorCookie.value = theme.value ? 'light' : 'dark';
		useStore().setTheme(theme.value ? 'light' : 'dark');
		document.documentElement.setAttribute('class', theme.value ? 'light' : 'dark');
		clearPWACaches();
	}

	onMounted(()=>{
		colorCookie = useCookie('nuxt-color-mode',{default:()=>"dark"});
		theme.value = 'dark' !== colorCookie.value;
		// changeTheme()

	})

</script>
<template>
	
	<el-switch
		v-model="theme"
        width="30"
		:active-action-icon="ElIconSunny"
		:inactive-action-icon="ElIconMoon"
		click-sound
		@change="changeTheme" />

</template>

<style lang="less" scoped>
	.el-switch {
		--el-switch-on-color: var(--transparent10);
    	--el-switch-off-color: var(--transparent10);
		:deep(.el-switch__core){
			min-width: 30px;
			&:hover{
				border-color: var(--transparent50);
			}
			.el-switch__action{
				background-color: black;
				.el-icon{
					color: rgb(var(--color-text-main));
				}
			}
		}
	}
</style>