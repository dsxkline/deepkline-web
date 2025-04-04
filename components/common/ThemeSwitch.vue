<script setup lang="ts">
	const colorMode = useColorMode();
    const colorCookie = useCookie('nuxt-color-mode',{default:()=>colorMode.preference});
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

</script>
<template>
	<el-switch
		v-model="theme"
        width="50" 
		inline-prompt
		:active-icon="ElIconSunny"
		:inactive-icon="ElIconMoon"
		@change="changeTheme" />
</template>
