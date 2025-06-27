<script lang="ts" setup>
	const props = defineProps<{
		label?: string
		value: any
		onSelect?: (value: any) => void
	}>()
	const emit = defineEmits(['select'])
	function returnBack() {
		setTimeout(() => {
			if (props.onSelect) props.onSelect(props.value)
			emit('select', props.value)
			useNuxtApp().$pop(props.value)
		}, 200)
	}
</script>
<template>
	<div @click="returnBack" class="py-3 px-4 select-option-item flex items-center cursor-pointer">
		<slot></slot>
		<span>{{ label }}</span>
	</div>
</template>
<style lang="less" scoped>
	.select-option-item {
		@apply py-2;
		&:hover {
			background-color: var(--transparent05);
		}

		&:active {
			background-color: var(--transparent05);
		}
	}
	@media (max-width: 999px) {
		.select-option-item {
			transition: background-color 0.1s ease;
			user-select: none;
			-webkit-tap-highlight-color: transparent;
			&:hover {
				background-color: transparent;
			}
		}
	}
</style>
