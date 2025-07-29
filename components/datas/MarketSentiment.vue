<script setup lang="ts">
	import { useRequestAnimation } from '~/composable/useRequestAnimation'
	import HalfCircleRainbow from './chart/HalfCircleRainbow.vue'
	import CryptoChangeChart from './chart/CryptoChangeChart.vue'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'

	const color = ref('')
	const value = ref(0)
	const slug = ref('')
	const desc = ref('')
	const animation = useRequestAnimation()
	const loading = ref(false)
	const error = ref('')
	function setValue(val: number) {
		animation.start({
			from: 0,
			to: val,
			duration: 600,
			onUpdate: (num: number) => {
				value.value = parseInt(String(num))
			}
		})
	}

	function getFear() {
		if (loading.value) return
		loading.value = true
		error.value = ''
		exchangeFetch
			.fear()
			.then(res => {
				loading.value = false
				if (res?.code === FetchResultDto.OK) {
					const data = res.data
					if (data && data?.value) {
						slug.value = data.slug
						desc.value = data.desc
						setValue(data.value)
					}
				}else{
					error.value = res?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	onMounted(() => {
		getFear()
	})
	onBeforeUnmount(() => {
		animation.stop()
	})
</script>
<template>
	<div class="market-sentiment px-4 py-2">
		<h3 class="pb-3 font-bold">市场情绪</h3>
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getFear">点击刷新</el-button>
			</template>
		</Error>

		<div class="rounded-md bg-[--transparent03] pb-3 flex justify-between" v-if="value && !loading">
			<div class="sentiment-chart relative w-3/5">
				<div class="absolute w-full h-full flex flex-col items-center justify-end" :style="'color:' + color">
					<b class="pt-6 text-xl font-extrabold roboto-bold">{{ value }}</b>
					<span class="text-xs" v-if="value">{{ slug }}</span>
					<span class="text-xs" v-else> - </span>
				</div>
				<HalfCircleRainbow :value="(value / 100) * 180" v-model:color="color" class="w-full" />
			</div>
			<div class="flex items-center justify-center pt-2">
				<span class="text-xs px-3 leading-5">{{ desc }}</span>
			</div>
		</div>
		<div class="rounded-md bg-[--transparent03] flex justify-center items-center px-4 min-h-[90px]" v-else>
			<el-skeleton animated class="flex items-center">
				<template #template style="--el-skeleton-circle-size: 100px">
					<el-skeleton-item variant="circle" style="width: 60px; height: 60px" />
				</template>
			</el-skeleton>
			<el-skeleton :rows="0" animated class="flex flex-col justify-center">
				<template #template>
					<el-skeleton-item variant="p" style="width: 100%; height: 14px" />
					<el-skeleton-item variant="p" style="width: 40%; height: 14px" class="mt-2" />
				</template>
			</el-skeleton>
		</div>

		<!-- 涨跌分布 -->
		<CryptoChangeChart />
	</div>
</template>
