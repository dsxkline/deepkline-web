<template>
	<div class="flex items-center justify-center z-50">
		<div class="loader" :style="[size ? 'width:' + size : '', size ? 'height:' + size : '']"></div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{ size?: string }>()
</script>

<style scoped>
	.loader {
		border: 3px solid var(--transparent10);
		border-top: 3px solid rgb(var(--color-text-main));
		border-radius: 99999px;
		width: 30px;
		height: 30px;
		animation: spin 1s ease-in-out infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
