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
					<div class="h-full col-span-3 w-full text-[10px] leading-normal *:rounded-sm items-center flex relative">
						<div class="h-4 absolute left-1/2 flex items-center text-grey">
							<div class="w-1 h-2 bg-[--transparent10] rounded-sm mr-1"></div>
							<span class="px-0 flex items-center h-full">0</span>
						</div>
						<div
							:class="['h-4 w-1/3 flex items-center absolute', item.left != undefined && 'funding-down', item.right != undefined && 'funding-up']"
							:style="[item.left != undefined ? 'left:' + Math.max(0, item.left) + '%' : '', item.right != undefined ? 'right:' + Math.max(0, item.right) + '%;justify-content:end;' : '']"
						>
							<span class="px-1 flex items-center h-full">{{item.left!=undefined?'-':item.right != undefined?'+':''}}0.0005%</span>
						</div>
						<div class="h-4 funding-bg w-full"></div>
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
	.funding-down {
		background: linear-gradient(to right, rgb(var(--color-red) / 0.5), rgb(var(--color-red) / 0));
	}
	.funding-up {
		background: linear-gradient(to left, rgb(var(--color-green) / 0.5), rgb(var(--color-green) / 0));
	}
	.funding-bg {
		background: linear-gradient(to left, var(--transparent00), var(--transparent10), var(--transparent00));
	}
</style>
