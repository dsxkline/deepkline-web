<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const { t } = useI18n()
	onMounted(() => {
		

	})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar/>
		<NavigationBar :title="t('订单')" :hideBack="true"/>
		
	</div>
</template>
