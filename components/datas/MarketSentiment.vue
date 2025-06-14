<script setup lang="ts">
	import { useRequestAnimation } from '~/composable/useRequestAnimation'

	const color = ref('')
	const value = ref(0)
	const animation = useRequestAnimation()
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
        setValue(120)
    })
    onBeforeUnmount(()=>{
        animation.stop()
    })
</script>
<template>
	<div class="market-sentiment p-4">
		<h3 class="pb-3">市场情绪</h3>
		<div class="rounded-md bg-[--transparent03] pb-3 flex justify-between">
			<div class="sentiment-chart relative w-3/5">
				<div class="absolute w-full h-full flex flex-col items-center justify-end" :style="'color:' + color">
					<b class="pt-6 text-xl">{{ value }}</b>
					<span class="text-xs" v-if="value">贪婪</span>
                    <span  class="text-xs" v-else> - </span>
				</div>
				<ChartsHalfCircleRainbow :value="value" v-model:color="color" class="w-full" />
			</div>
			<div class="flex items-center justify-center pt-2">
				<span class="text-xs px-3">过渡贪婪表明投资者过于乐观，行情丞待修正。</span>
			</div>
		</div>
	</div>
</template>
