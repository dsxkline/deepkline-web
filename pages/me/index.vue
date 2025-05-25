<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?:boolean
	}>()
	onMounted(() => {
		

	})
</script>
<template>
	<div class="w-full h-full">
		
		<NavigationBar title="我的" :hideBack="!push"/>
	</div>
</template>
