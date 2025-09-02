<script setup lang="ts">
	const props = defineProps<{
		modelValue?: boolean
	}>()
	const emit = defineEmits(['update:modelValue'])
	let timer: NodeJS.Timeout | null = null
	const timeout = 3
	const second = ref(timeout)
	const opacity = ref(1)
	const closed = ref(true)
	function createTimer() {
		clearTimer()
		timer = setInterval(() => {
			second.value--
			if (second.value <= 0) {
				clearTimer()
				hide()
			}
		}, 1000)
	}
	function clearTimer() {
		if (timer) clearInterval(timer)
	}
	function hide() {
		opacity.value = 0
		emit('update:modelValue', true)
		console.log('startup', props.modelValue)
		setTimeout(() => {
			closed.value = true
		}, 200)
	}
	onMounted(() => {
		//closed.value = false
		createTimer()
		setTimeout(() => {
			// 隐藏掉服务端渲染的
			const statups = document.querySelectorAll('.startup-container')
			statups.forEach(item => {
				;(item as HTMLDivElement).style.display = 'none'
			})
			emit('update:modelValue', true)
			//closed.value = false
		}, 500)
	})
	onBeforeUnmount(() => {
		clearTimer()
	})
</script>
<template>
	<div
		class="startup-container bg-base fixed top-0 left-0 w-full h-full z-[999999] transition-all flex items-center justify-center"
		v-if="!closed"
		:style="{
			opacity: opacity
		}"
	>
		<LogoFace class="mt-[-100px]" />
		<!-- <img src="/images/pwa/launch-iphonexsmax-1242x2688.png" class="w-full h-full object-cover" /> -->
		<ClientOnly>
			<span class="absolute top-4 right-4 px-4 py-2 bg-[--transparent10] rounded-full text-xs" @click="hide">跳过 {{ second }}s</span>
		</ClientOnly>
	</div>
</template>
<style scoped lang="less">
	.light .startup-container {
		&::before {
			background-image: unset;
		}
	}
	.startup-container {
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
			opacity: 0.15;
		}
	}
</style>
