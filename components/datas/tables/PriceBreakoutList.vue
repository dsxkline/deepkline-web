<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	const loading = ref(true)
	const datas = ref([
		{
			instId: 'BTC-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: -10 // 位置 10%
		},
		{
			instId: 'ETH-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 15 // 位置 10%
		},
		{
			instId: 'SOL-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			right: 10 // 位置 10%
		},
		{
			instId: 'TRUMP-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			right: 20 // 位置 10%
		},
		{
			instId: 'TIA-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			right: -50 // 位置 10%
		},
		{
			instId: 'MEME-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 50
		},
		{
			instId: 'BTC-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 30
		},
		{
			instId: 'BTC-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 30
		},
		{
			instId: 'BTC-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 30
		},
		{
			instId: 'BTC-USDT',
			up: 11200, // 压力位
			dowm: 95600, // 支撑位
			left: 30
		}
	])
	function update() {
		loading.value = false
	}

	onMounted(() => {})

	defineExpose({
		update
	})
</script>
<template>
	<div class="py-2">
		<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between *:min-h-10" v-if="!loading">
			<template v-for="item in datas">
				<li>
					<div class="col-span-2 flex items-center" v-autosize="16">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.instId)" />
					</div>

					<div class="col-span-3 w-full text-[10px] *:rounded-sm items-center flex relative">
						<div class="h-1 w-1 absolute left-5 bg-red" :style="[item.left != undefined ? (item.left < 0 ? 'left:' + Math.abs(item.left / 2) + '%' : '') : '']"></div>
						<div class="h-1 w-1 absolute right-5 bg-green" :style="[item.right != undefined ? (item.right < 0 ? 'right:' + Math.abs(item.right / 2) + '%' : '') : '']"></div>
						<div
							:class="['h-4 w-1/2 absolute flex items-center', item.left != undefined && 'breakout-down', item.right != undefined && 'breakout-up', item.right == 50 || item.left == 50 ? 'breakout-none' : '']"
							:style="[item.left != undefined ? 'left:' + Math.max(0, item.left) + '%' : '', item.right != undefined ? 'right:' + Math.max(0, item.right) + '%;justify-content:end;' : '']"
						>
							<div class="flex items-center px-1 h-full" v-autosize="10">
								<SymbolPrice :symbol="useSymbolStore().getSymbol(item.instId)" class="!text-[10px] h-full leading-normal *:!font-normal"/>
							</div>
						</div>
						<div class="h-4 bg-[--transparent05] w-full"></div>
					</div>
				</li>
			</template>
		</ul>
		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-else>
			<template v-for="item in 10">
				<div class="h-10 flex items-center">
					<el-skeleton :rows="0" animated class="col-span-2 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 70%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="col-span-3 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 100%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
			</template>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.breakout-down {
		background: linear-gradient(to right, rgb(var(--color-red) / 0.5), rgb(var(--color-red) / 0));
	}
	.breakout-up {
		background: linear-gradient(to left, rgb(var(--color-green) / 0.5), rgb(var(--color-green) / 0));
	}
	.breakout-none {
		background: transparent;
		width: 5px;
	}
</style>
