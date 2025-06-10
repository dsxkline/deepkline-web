<script lang="ts" setup>
	const props = defineProps<{
		label?: string
		value: any
	}>()
	function returnBack() {
		setTimeout(() => {
			useNuxtApp().$pop(props.value)
		}, 200)
	}
</script>
<template>
	<div @click="returnBack" class="py-2 px-4 select-option-item flex items-center">
		<slot></slot>
		<span>{{ label }}</span>
	</div>
</template>
<style lang="less" scoped>
	.select-option-item {
		&:hover {
			background-color: transparent;
		}
		transition: background-color 0.2s ease;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		&:active {
			background-color: var(--transparent05);
		}
	}
</style>
