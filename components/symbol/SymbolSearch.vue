<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	const keyword = ref('')

	const search = () => {}

	onMounted(() => {
		
	})
</script>
<template>
	<div class="w-[600px]">
		<el-input v-model="keyword" placeholder="Please Input" :prefix-icon="Search" class="w-[100%] px-4 py-3" @keyup.enter="search" />
		
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			padding: 0 16px;
			border-bottom: 1px solid var(--transparent05);
		}
	}
	:deep(.el-input){
		.el-input__wrapper{
			box-shadow: 0 0 0 1px var(--transparent10) inset;
			border-radius: 8px;
			.el-input__inner{
				height: 25px;
				line-height: 25px;
			}
		}
	}
</style>
