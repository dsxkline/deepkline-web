<script lang="ts" setup>
	
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?:boolean
	}>()
	function pushAddAccount(){

    }
	onMounted(() => {
		

	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="账户" :hideBack="!push">
		<template #right>
				<button class="flex items-center p-2" @click="pushAddAccount">
					<el-icon class="!w-5 !h-5"><Plus class="!w-5 !h-5"/></el-icon>
				</button>
			</template>
		</NavigationBar>
		
		
	</div>
</template>
