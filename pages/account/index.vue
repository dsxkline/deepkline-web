<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import AccountList from './account-list.vue'
	import { usePush } from '~/composable/usePush'
	import ExchangeIndex from '../exchange/index.vue'
	import { useUserStore } from '~/store/user'
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
		<ExchangeIndex v-if="!useUserStore().accounts?.length" />
		<template v-else>
			<NavigationBar title="账户" :hideBack="!push">
				<template #right>
					<button class="flex items-center p-2" @click="pushAccountList">
						<AccountSyncIcon class="w-5 h-5" />
					</button>
				</template>
			</NavigationBar>
		</template>
	</div>
</template>
