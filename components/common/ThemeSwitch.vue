<script setup lang="ts">
	const colorMode = useColorMode();
    let colorCookie = useCookie('nuxt-color-mode',{default:()=>"dark"});
	const theme = ref("dark" !== colorCookie.value);
	watch(
		() => colorMode.preference,
		(val) => {
			colorCookie.value = val;
		}
	);

	function changeTheme(){
		colorMode.preference = theme.value ? 'light' : 'dark'
	}

	onMounted(()=>{
		colorCookie = useCookie('nuxt-color-mode',{default:()=>colorMode.preference});
		theme.value = 'dark' !== colorCookie.value;
		changeTheme()

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
			.el-switch__action{
				background-color: black;
				.el-icon{
					color: rgb(var(--color-text-main));
				}
			}
		}
	}
</style>