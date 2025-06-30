<script lang="ts" setup>
	import { usePush } from '~/composable/usePush';
import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
import CreateSuccess from './open-success.vue';
	const props = defineProps<{
		push?: boolean
	}>()
    const usepush = usePush()
	function submitAddAccount() {
        usepush(CreateSuccess)
    }
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="开通模拟账户" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - 44px - var(--safe-bottom))' }" :always="false">
			<div class="p-4 text-xs text-grey border border-[--transparent05] rounded-lg bg-[--transparent05] m-4">
				<div class="text-sm font-bold mb-4 text-main">模拟账户开通说明</div>
				<p class="mb-2">1. 模拟账户是一个用于模拟交易的虚拟账户，您可以在其中进行交易练习。</p>
				<p class="mb-2">2. 模拟账户不涉及真实资金，所有交易均为虚拟操作。</p>
				<p class="mb-2">3. 模拟账户的资金和交易记录不会影响您的真实账户。</p>
				<p class="mb-2">4. 模拟账户的交易数据仅供学习和测试使用。</p>
				<p class="mb-2">5. 您可以随时创建或删除模拟账户。</p>
				<p class="mb-2">6. 模拟账户的交易规则和限制可能与真实账户有所不同，请在使用前仔细阅读相关说明。</p>
				<p class="mb-2">7. 模拟账户的交易结果仅供参考，不代表实际交易结果。</p>
				<p class="mb-2">8. 模拟账户的使用不需要提供任何个人信息或资金。</p>
			</div>
		</ScrollBar>

		<div class="fixed bottom-0 left-0 right-0 p-4">
			<button class="w-full h-[44px] bg-brand text-white rounded-lg" @click="submitAddAccount">确认开通</button>
		</div>
	</div>
</template>
