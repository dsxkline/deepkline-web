<script setup lang="ts">
	const props = defineProps({
		content: {
			type: String,
			default: ''
		}
	})
</script>
<template>
	<div class="error-container w-full h-full flex flex-col items-center justify-center">
		<el-icon class="!text-grey/30 !w-[60px] !h-[60px] *:!w-[60px] *:!h-[60px] my-2"><CoffeeCup /></el-icon>
		<p class="text-sm text-grey" v-if="content">{{ content }}</p>
		<div class="p-3">
			<slot />
		</div>
	</div>
</template>
<style lang="less" scoped>
	.error-container {
		:deep(button) {
			background-color: var(--transparent10);
			border: 1px solid var(--transparent05);
			color: rgb(var(--color-text-grey));
			&:hover {
				// color: rgb(var(--color-text-main));
				border: 1px solid var(--transparent20);
                background-color: var(--transparent10);
			}
		}
	}
</style>
