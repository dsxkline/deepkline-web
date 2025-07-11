<template>
	<div class="dialog-push">
		<el-dialog v-model="dialogVisible" :width="width || '500px'" :destroy-on-close="true" @closed="closed" :draggable="true">
			<template #header v-if="title">{{ title }}</template>
			<template #default v-if="msg">{{ msg }}</template>
			<template #default v-if="to">
				<ScrollBar :wrap-style="{ height: height || '500px' }" :always="true" class="dialog-push-container">
					<component :is="to" :push="true" @dialogClose="handleClose" v-bind="params" :height="parseFloat(height || '0')" :dialog="instance" />
				</ScrollBar>
			</template>
			<template #footer>
				<div class="dialog-footer" v-if="showCannel || showConfirm">
					<el-button @click="dialogVisible = false" v-if="showCannel">Cancel</el-button>
					<el-button type="primary" @click="dialogVisible = false" v-if="showConfirm"> Confirm </el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from 'vue'
	import { getCurrentInstance, render } from 'vue'
	const instance = getCurrentInstance()
	const props = defineProps<{
		width?: string
		height?: string
		url?: string
		to?: any
		title?: string
		msg?: string
		showCannel?: boolean
		showConfirm?: boolean
		params?: any
		destroy?: () => void
	}>()

	// 给子组件全局注入当前dialog实例
	provide('currentDialog', instance)

	const dialogVisible = ref(true)

	const handleClose = () => {
		dialogVisible.value = false
	}

	const closed = () => {
		props.destroy && props.destroy()
	}

    defineExpose({
        close:handleClose
    })
</script>
