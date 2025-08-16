<script setup lang="ts">
	import { useStore } from '~/store'
	import { useKlineStore } from '~/store/kline'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
	}>()
	const popCycleBar = ref()
	const isDestroyed = ref(false)
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	const cycleList = ref([
		{ label: '1分', value: '1m', display: true },
		{ label: '5分', value: '5m', display: true },
		{ label: '15分', value: '15m', display: false },
		{ label: '30分', value: '30m', display: useStore().isH5 ? false : true },
		{ label: '1小时', value: '1H', display: true },
		{ label: '2小时', value: '2H', display: false },
		{ label: '4小时', value: '4H', display: false },
		{ label: '1日', value: '1D', display: true },
		{ label: '1周', value: '1W', display: useStore().isH5 ? false : true },
		{ label: '1月', value: '1M', display: useStore().isH5 ? false : true }
	])
	const cycle = ref(localStorage.getItem('cycle') || '1m')
	const popHide = (e?: Event) => {
		if (e) {
			const target = e.target as HTMLElement
			if (!target.closest('.popover-cycle-bar')) {
				if (popCycleBar.value) popCycleBar.value.hide()
			}
			return
		}
		if (popCycleBar.value) popCycleBar.value.hide()
	}
	const onCycleChange = async (value: string) => {
		popHide()
		if (useKlineStore().loading[symbolObj.value.symbol]) return
		cycle.value = value
		useKlineStore().setCycle(symbolObj.value.symbol, value)
	}
	const showHideMenu = computed(() => {
		// 是否存在
		const menu = cycleList.value.find(item => !item.display && item.value == cycle.value)
		return menu
	})
	const moreText = computed(() => {
		return showHideMenu.value?.label || '更多'
	})

	onMounted(() => {
		document.addEventListener('touchstart', popHide)
	})
	onBeforeUnmount(() => {
		isDestroyed.value = true
		document.removeEventListener('touchstart', popHide)
		popCycleBar.value = null
		cycleList.value = []
	})
</script>
<template>
	<div class="cycle-bar w-full flex items-center gap-1">
		<div class="flex gap-1 *:h-6 *:px-2 *:rounded *:text-sm *:cursor-pointer *:text-grey *:flex *:items-center *:leading-none">
			<template v-for="(item, index) in cycleList">
				<div class="cycle-bar-item" :key="index" :class="{ active: item.value === cycle }" v-click-sound @click="onCycleChange(item.value)" v-if="item.display">
					{{ item.label }}
				</div>
			</template>
			<el-popover placement="bottom" trigger="click" width="auto" ref="popCycleBar" v-if="!isDestroyed">
				<div class="popover-cycle-bar grid grid-cols-4 gap-2 w-[250px]" v-if="!isDestroyed">
					<template v-for="(item, index) in cycleList">
						<div
							class="popover-cycle-bar-item h-6 flex items-center text-xs text-grey justify-center px-2 text-nowrap cursor-pointer border border-[--border-color] rounded bg-[--transparent05] hover:bg-[--transparent10]"
							:class="[item.value === cycle ? 'active !text-main bg-[--transparent20]' : '']"
							v-click-sound
							@click="onCycleChange(item.value)"
							v-if="!isDestroyed"
						>
							{{ item.label }}
						</div>
					</template>
				</div>
				<template #reference>
					<button :class="['cycle-bar-item flex items-center !pr-0', showHideMenu ? 'active !text-main bg-[--transparent20]' : '']" v-if="!isDestroyed">
						<span>{{ moreText }}</span
						><el-icon class="mx-1"><CaretBottom /></el-icon>
					</button>
				</template>
			</el-popover>
		</div>

		<el-divider direction="vertical" v-if="!useStore().isH5"></el-divider>

		<div class="flex items-center *:h-full *:flex *:items-center">
			<button class="pl-1"><IndicatorIcon class="w-4 h-4" /></button>
			<button class="pl-4">
				<el-icon class="!w-4 !h-4 !text-[var(--transparent70)] hover:!text-main"><Tools class="!w-4 !h-4" /></el-icon>
			</button>
		</div>
	</div>
</template>
<style scoped lang="less">
	.light {
		.cycle-bar {
			.cycle-bar-item {
				padding: 0;
				@apply mx-2;
			}
			.cycle-bar-item:not(.active):hover {
				background: none;
				color: rgb(var(--color-text-main));
			}
			.active {
				background: none;
				color: rgb(var(--color-text-main));
				border-bottom: 1px solid rgb(var(--color-text-main));
				border-radius: 0;
				.el-icon {
					margin-right: -2px;
				}
			}
		}
		.popover-cycle-bar {
			.popover-cycle-bar-item {
				background: rgba(255, 255, 255, 0.8);
				&:hover {
					border-color: var(--transparent20);
					background-color: rgba(255, 255, 255, 0.5);
				}
				&.active {
					border-color: var(--transparent20);
					background: rgba(255, 255, 255, 1);
				}
			}
		}
	}
	.cycle-bar {
		.cycle-bar-item:not(.active):hover {
			background-color: var(--transparent05);
		}
		.active {
			background-color: var(--transparent20);
			color: rgb(var(--color-text-main));
		}
	}
	@media (max-width: 999px) {
		.cycle-bar {
			justify-content: space-between;
			max-width: 100%;
			overflow-x: scroll;
			flex-wrap: nowrap;
			/* 隐藏滚动条 */
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE/Edge */
			&::-webkit-scrollbar {
				display: none; /* Chrome/Safari */
			}
			.cycle-bar-item {
				white-space: nowrap;
				@apply px-0 py-2 !mr-4 !ml-0 rounded-none flex items-center;
				padding: 6px 0;
			}
			.cycle-bar-item:not(.active):hover {
				background-color: unset;
			}
			.active {
				background-color: unset;
				color: rgb(var(--color-text-main));
				border-bottom: 1px solid rgb(var(--color-text-main));
			}
		}
		.popover-cycle-bar {
			width: calc(var(--body-width) - 10px - 24px - 2px);
		}
	}
</style>
