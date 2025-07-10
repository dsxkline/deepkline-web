<script setup lang="ts">
	import type { SymbolDto } from '~/fetch/dtos/symbol.dto';
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	function favorite(item: SymbolDto) {
		useSymbolStore().favoriteSymbol(item)
	}
</script>
<template>
	<button v-click-sound @click.stop="favorite(symbolObj)" :class="['!w-6 !h-6 *:!w-6 *:!h-6 [&_svg]:!h-5 [&_svg]:!w-5 relative flex items-center justify-center', useSymbolStore().isFavorite(symbolObj) ? 'favorite' : '']">
		<el-icon class="!absolute top-0 left-0"><Star /></el-icon>
		<el-icon class="!absolute top-0 left-0"><StarFilled v-if="useSymbolStore().isFavorite(symbolObj)" /></el-icon>
	</button>
</template>
<style lang="less" scoped>
	button {
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
