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

</script>
<template>
	<el-switch
		v-model="theme"
        width="50" 
		inline-prompt
		:active-icon="ElIconSunny"
		:inactive-icon="ElIconMoon"
		@change="colorMode.preference = theme ? 'light' : 'dark'" />
</template>
