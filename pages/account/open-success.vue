<script lang="ts" setup>
	import type { ComponentInternalInstance } from 'vue/dist/vue.js';
import type ExchangeLogo from '~/components/common/ExchangeLogo.vue'
	import type { AccountDto } from '~/fetch/dtos/account.dto'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?: boolean
		account?: AccountDto
	}>()
	// 如果是dialog打开
	const currentDialog: ComponentInternalInstance | null | undefined = inject('currentDialog') // 也能拿到
	function goback() {
		useNuxtApp().$popRoot(null, -2)
		// dialog环境打开
		currentDialog?.exposed && currentDialog.exposed.close()
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="开通成功" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc('+(currentDialog?currentDialog.props.height:'var(--body-height)')+' - var(--nav-height) - 78px - var(--safe-bottom))' }" :always="false">
			<div class="open-success">
				<div class="flex flex-col items-center justify-center h-full pb-6">
					<OpenDemoSuccessIcon class="w-1/2 max-w-[200px] m-6" />
					<h1 class="text-2xl font-bold mb-2 text-main">开通成功</h1>
					<p class="text-grey text-sm">您的账户已成功开通，您可以开始交易了！</p>
				</div>
				<!-- 显示开通的账户详细信息 -->
				<div class="p-4 text-sm border border-[--transparent05] rounded-lg bg-[--transparent05] m-4 pb-2 text-main">
					<div class="text-sm font-bold mb-2 pb-2 border-b border-[--transparent05]">账户信息</div>
					<ul class="*:flex *:items-center *:justify-between *:py-2 [&_span]:text-grey">
						<li>
							<span>账户类型：</span>
							<div>模拟账户</div>
						</li>
						<li>
							<span>账户ID：</span>
							<div>{{ account?.accountId }}</div>
						</li>
						<li>
							<span>经纪商：</span>
							<div class="flex items-center gap-1"><ExchangeLogo :exchange="account?.exchange" class="w-4" />{{ account?.exchange }}</div>
						</li>
						<li>
							<span>初始资金：</span>
							<div>{{ formatPrice(account?.initialAmount, '2') }} {{ account?.currency }}</div>
						</li>
					</ul>
				</div>
			</div>
		</ScrollBar>

		<div class="fixed bottom-[var(--safe-bottom)] left-0 right-0 p-4">
			<el-button size="large" :class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', '!bg-brand !text-white']" @click="goback">返回</el-button>
		</div>
	</div>
</template>

<style lang="less" scoped>
.open-success{
	@apply flex justify-center px-6 gap-20 w-full h-full items-center;
}
</style>