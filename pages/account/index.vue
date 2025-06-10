<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import AccountList from './account-list.vue'
	import { usePush } from '~/composable/usePush'
	const props = defineProps<{
		push?: boolean
	}>()
	const pushLeft = usePush()
	function pushAccountList() {
		pushLeft(AccountList)
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="账户" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2" @click="pushAccountList">
					<AccountSyncIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
	</div>
</template>
