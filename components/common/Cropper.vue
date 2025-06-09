<script setup lang="ts">
	import 'vue-cropper/dist/index.css'
	import { VueCropper } from 'vue-cropper'
	const props = defineProps<{
		img: string
		size?: number
		outputType?: string
		successCallback: (data: string) => void
	}>()
	const cropper = ref()
	const save = () => {
		cropper.value.getCropBlob((data: string) => {
			// do something
			console.log(data)
			if (props.successCallback) props.successCallback(data)
            useNuxtApp().$pop()
		})
	}
</script>
<template>
	<div class="h-[--body-height] cancel-stop-touch">
		<NavigationBar ref="navbar" title="裁剪图片" :hideBack="true">
			<template #right>
				<el-button :class="['w-full transition-all !py-2 !h-8 !text-sm bt-default', '!bg-brand !text-white']" @click="save">确定</el-button>
			</template>
		</NavigationBar>
		<VueCropper ref="cropper" mode="cover" :img="img" :outputSize="size || 1" :outputType="outputType || 'png'" :autoCrop="true" :fixed="true" :centerBox="true" :canMove="true" class="w-full h-full"></VueCropper>
	</div>
</template>
