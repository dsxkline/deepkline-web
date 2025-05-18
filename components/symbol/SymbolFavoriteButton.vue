<script setup lang="ts">
	import type { Instruments } from '~/fetch/okx/okx.type'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	function favorite(item: Instruments) {
		useSymbolStore().favoriteSymbol(item)
	}
</script>
<template>
	<button click-sound @click="favorite(symbolObj)" :class="['!w-[16px] !h-[16px] relative flex items-center justify-center', useSymbolStore().isFavorite(symbolObj) ? 'favorite' : '']">
		<el-icon class="!absolute top-0 left-0"><Star /></el-icon>
		<el-icon class="!absolute top-0 left-0"><StarFilled v-if="useSymbolStore().isFavorite(symbolObj)" /></el-icon>
	</button>
</template>
<style lang="less" scoped>
	button {
		height: 30px;
		@apply px-1 rounded-md cursor-pointer mx-1 flex items-center justify-center;
		&:hover {
			.el-icon {
				@apply text-main;
			}
		}
		&.favorite {
			:deep(.el-icon) {
				svg {
					path {
						fill: rgb(var(--color-yellow));
					}
				}
			}
		}
	}
</style>
