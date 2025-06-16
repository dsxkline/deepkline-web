<script lang="ts" setup>
	import { useRefreshChildEvent } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'

	onMounted(() => {})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="交易" :hideBack="true" />
	</div>
</template>
