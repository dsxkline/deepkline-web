<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { InstanceType, type Instruments } from '~/fetch/okx/okx.type.d'
	import MarketList from './search/MarketList.vue'
	import { useSymbolStore } from '~/store/symbol'
	const keyword = ref('')
	const show = ref(false)
	const inputDom = ref()
	const search = () => {
		show.value = true
	}
	const focus = () => {
		show.value = true
	}

	const hide = (e: Event) => {
		// 判断e是否是Instruments类型
		if ((e as unknown as Instruments)?.instId) {
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
		inputDom.value?.focus()
	})

	onUnmounted(() => {
		inputDom.value = null
		// 移除事件监听器
		document.removeEventListener('click', hide)
	})
</script>
<template>
	<div class="w-[600px] relative symbol-search">
		<div class="flex items-center justify-center text-xs text-grey w-[100%] h-[25px] bg-[--transparent05] rounded-lg border border-[--transparent10] cursor-pointer" click-sound @click="search">
			<el-icon><Search /></el-icon>
			<span class="px-2">{{ useSymbolStore().getActiveSymbol()?.instId }}</span>
		</div>
		<div v-if="show" class="search-list absolute top-0 left-0 w-[100%] z-10 bg-base rounded-lg border border-[--transparent10] overflow-hidden">
			<div class="bg-[--transparent05]">
				<el-input ref="inputDom" v-model="keyword" placeholder="Please Input" :prefix-icon="Search" class="w-[100%] p-2" @focus="focus" @input="search" />
				<div class="w-[100%] min-h-[316px] max-h-[50vh] p-2">
					<MarketList :height="300" :keyword="keyword" @clickHandle="hide" :isSearchList="true" />
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.light .search-list {
		&::before {
			background-image: unset;
		}
	}
	.search-list {
		&::before {
			background-image: linear-gradient(180deg, #cc10b0, #52247f, #112d6b);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.15;
		}
	}
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-4;
			border-bottom: 1px solid var(--transparent05);
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					font-size: 16px;
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
</style>
