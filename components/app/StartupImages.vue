<script setup lang="ts">
	const props = defineProps<{
		modelValue: boolean
	}>()
	const emit = defineEmits(['update:modelValue'])
	let timer: NodeJS.Timeout | null = null
	const timeout = 3
	const second = ref(timeout)
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
		emit('update:modelValue', true)
	}
	onMounted(() => {
		createTimer()
	})
	onBeforeUnmount(() => {
		clearTimer()
	})
</script>
<template>
	<div class="fixed top-0 left-0 w-full h-full z-[999999]" v-if="second">
		<img src="/images/pwa/launch-iphonexsmax-1242x2688.png" class="w-full h-full object-cover" />
		<ClientOnly>
			<span class="absolute top-4 right-4 px-4 py-2 bg-[--transparent10] rounded-full text-xs" @click="hide">跳过 {{ second }}s</span>
		</ClientOnly>
	</div>
</template>
