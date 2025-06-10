<script lang="ts" setup>
	import { render } from 'vue'
	import { usePushUp } from '~/composable/usePush'

	const props = defineProps<{
		modelValue?: string
		title?: string
	}>()
	const emit = defineEmits<{
		(e: 'update:modelValue', value: string): void
	}>()
	const pushUp = usePushUp()
	const container = ref<HTMLElement>()
	const slots = useSlots()

	const pushUpContainer = () => {
		const vnode = slots.default?.()
		console.log('console', vnode)
		if (vnode) {
			//render(h('div', {}, vnode), container.value);
			const newVnode = h('div', { class: 'py-4' }, vnode)

			pushUp(newVnode)
		}
	}

	function onPop(data: any) {
		console.log('onpop', data)
		emit('update:modelValue', data)
	}

	onMounted(() => {})

	defineExpose({
		onPop
	})
</script>
<template>
	<div class="bg-[--transparent02] px-3 py-1 border border-[--transparent05] rounded-sm flex items-center justify-between" @click="pushUpContainer">
		<div class="flex items-center">
			<div v-if="title" class="text-sm py-2 pr-3 text-grey">{{ title }}</div>
			<div>{{ modelValue }}</div>
		</div>
		<el-icon><ArrowDown /></el-icon>
	</div>
</template>
