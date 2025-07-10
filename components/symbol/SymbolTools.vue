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
	<div class="symbol-tools flex items-center text-ms">
		<SymbolFavoriteButton :symbol="symbol"/>
	</div>
</template>
<style lang="less" scoped>
	.symbol-tools {
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
	}
</style>
