<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { InstanceType } from '~/fetch/okx/okx.type.d'
	import MarketList from './search/MarketList.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	import type { SymbolDto } from '~/fetch/dtos/symbol.dto'
	const props = defineProps<{
		push?: boolean
		selectHandle?: (item: SymbolDto) => void
	}>()
	const keyword = ref('')
	const show = ref(false)
	const inputDom = ref()
	const height = computed(() => {
		let h = 300
		if (useStore().isH5) {
			h = useStore().bodyHeight - (inputDom.value?.clientHeight || 50)
		}
		return h
	})
	const search = () => {
		show.value = true
	}
	const focus = () => {
		show.value = true
	}

	const hide = (e: Event) => {
		// 判断e是否是SymbolDto类型
		if ((e as unknown as SymbolDto)?.symbol) {
			show.value = false
			return
		}

		const target = e.target as HTMLElement
		if (!target.closest('.symbol-search')) {
			if (show.value) useNuxtApp().$clickSound()
			show.value = false
		}
	}

	watch(
		() => show.value,
		(n, o) => {
			if (n) {
				nextTick(() => {
					if (inputDom.value) {
						inputDom.value.focus()
					}
				})
			}
		}
	)

	onMounted(() => {
		// 点击其他区域隐藏
		document.addEventListener('click', hide)
	})

	onUnmounted(() => {
		inputDom.value = null
		// 移除事件监听器
		document.removeEventListener('click', hide)
	})
</script>
<template>
	<div class="w-[600px] relative symbol-search">
		<div
			class="symbol-search-item flex items-center justify-center text-xs text-grey w-[100%] h-[25px] bg-[--transparent05] rounded-lg border border-[--transparent10] cursor-pointer"
			v-click-sound
			@click="search"
		>
			<el-icon><Search /></el-icon>
			<span class="px-2">{{ useSymbolStore().getActiveSymbol()?.symbol }}</span>
		</div>
		<div v-if="show || push" class="search-list absolute top-0 left-0 w-[100%] z-10 bg-base rounded-lg border border-[--transparent10] overflow-hidden">
			<div class="search-list-box bg-[--transparent05]">
				<div class="flex">
					<el-input ref="inputDom" v-model="keyword" placeholder="Please Input" :prefix-icon="Search" class="p-3 pr-0" @focus="focus" @input="search" />
					<button class="flex items-center text-nowrap px-4" @click="useNuxtApp().$pop()" v-if="useStore().isH5">取消</button>
				</div>
				<div class="search-list-content w-[100%] min-h-[316px] max-h-[50vh] py-2">
					<MarketList :height="height" :keyword="keyword" @clickHandle="hide" :selectHandle="selectHandle" :isSearchList="true" />
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.symbol-search-item {
			background-color: white;
		}
		.search-list {
			.search-list-box {
				background-color: white;
				:deep(.el-input) {
					.el-input__wrapper {
						// box-shadow: 0 0 0 1px var(--el-input-focus-border) inset;
						background: white;
					}
				}
			}
			&::before {
				background-image: unset;
			}
		}
	}
	.search-list {
		&::before {
			background-image: var(--bg-linear-180);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.2;
		}
		:deep(.symbol-list-header) {
			@apply px-3;
		}
		:deep(.symbol-list-content) {
			ul {
				li {
					@apply px-3;
				}
			}
		}
	}
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-3;
			border-bottom: 1px solid var(--transparent05);
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					@apply text-base;
				}
			}
		}
	}
	:deep(.el-input) {
		.el-input__wrapper {
			// box-shadow: 0 0 0 1px var(--el-input-focus-border) inset;
			box-shadow: none;
			border: 1px solid rgb(var(--color-brand));
			border-radius: 8px;
		}
	}

	@media (max-width: 999px) {
		.symbol-search {
			width: 100%;
			height: var(--body-height);
			.symbol-search-item {
				display: none;
				border-radius: 0;
			}

			.search-list {
				border-radius: 0;
				border: none;
				background: transparent;
				&::before {
					opacity: 0;
				}
				.search-list-box {
					background-color: transparent;
					:deep(.el-input) {
						.el-input__wrapper {
							border-radius: var(--el-border-radius-base);
						}
					}
					.search-list-content {
						max-height: unset;
						padding: 0;
					}
				}
			}
		}
	}
</style>
