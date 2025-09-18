<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
	}>()
	function pushAddAccount() {}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar :title="t('帮助')" :hideBack="!push">
			
		</NavigationBar>
	</div>
</template>
