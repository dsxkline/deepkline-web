<script setup lang="ts">
	import { useRequestAnimation } from '~/composable/useRequestAnimation'

	const color = ref('')
	const value = ref(0)
	const animation = useRequestAnimation()
	const loading = ref(true)
	function setValue(val: number) {
		animation.start({
			from: 0,
			to: val,
			duration: 600,
			onUpdate: (val: number) => {
				value.value = parseInt(String(val))
			}
		})
	}
	onMounted(() => {
		setTimeout(() => {
			loading.value = false
			setValue(120)
		}, 0)
	})
	onBeforeUnmount(() => {
		animation.stop()
	})
</script>
<template>
	<div class="market-sentiment p-4">
		<h3 class="pb-3">市场情绪</h3>
		<div class="rounded-md bg-[--transparent03] pb-3 flex justify-between" v-if="value && !loading">
			<div class="sentiment-chart relative w-3/5">
				<div class="absolute w-full h-full flex flex-col items-center justify-end" :style="'color:' + color">
					<b class="pt-6 text-xl font-extrabold roboto-bold">{{ value }}</b>
					<span class="text-xs" v-if="value">贪婪</span>
					<span class="text-xs" v-else> - </span>
				</div>
				<ChartsHalfCircleRainbow :value="value" v-model:color="color" class="w-full" />
			</div>
			<div class="flex items-center justify-center pt-2">
				<span class="text-xs px-3 leading-5">过渡贪婪表明投资者过于乐观，行情丞待修正。</span>
			</div>
		</div>
		<div class="rounded-md bg-[--transparent03] flex justify-start items-center px-4 min-h-[100px]" v-else>
			<el-skeleton animated>
				<template #template style="--el-skeleton-circle-size: 100px">
					<el-skeleton-item variant="circle" style="width: 60px; height: 60px" />
				</template>
			</el-skeleton>
			<el-skeleton :rows="0" animated>
				<template #template>
					<el-skeleton-item variant="p" style="width: 100%; height: 14px" />
					<el-skeleton-item variant="p" style="width: 40%; height: 14px" />
				</template>
			</el-skeleton>
		</div>

        <!-- 涨跌分布 -->
         <ChartsCryptoChangeChart/>
	</div>
</template>
