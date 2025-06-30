<script lang="ts" setup>
	import type ExchangeLogo from '~/components/common/ExchangeLogo.vue';
import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?: boolean
	}>()
	function goback() {
		useNuxtApp().$popRoot(null, -2)
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="开通成功" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - 44px - var(--safe-bottom))' }" :always="false">
			<div>
				<div class="flex flex-col items-center justify-center h-full">
					<OpenDemoSuccessIcon class="w-1/2 m-6" />
					<h1 class="text-2xl font-bold mb-2">开通成功</h1>
					<p class="text-grey text-sm">您的账户已成功开通，您可以开始交易了！</p>
				</div>
				<!-- 显示开通的账户详细信息 -->
				<div class="p-4 text-sm border border-[--transparent05] rounded-lg bg-[--transparent05] m-4 pb-2">
					<div class="text-sm font-bold mb-2 pb-2 border-b border-[--transparent05]">账户信息</div>
					<ul class="*:flex *:items-center *:justify-between *:py-2 [&_span]:text-grey">
						<li>
							<span>账户类型：</span>
							<div>模拟账户</div>
						</li>
						<li>
							<span>账户ID：</span>
							<div>12345678</div>
						</li>
						<li>
							<span>经纪商：</span>
							<div class="flex items-center gap-1"><ExchangeLogo :exchange="'deepkline'" class="w-4"/> DeepKline</div>
						</li>
						<li>
							<span>初始资金：</span>
							<div>100,000 USDT</div>
						</li>
					</ul>
				</div>
			</div>
		</ScrollBar>

		<div class="fixed bottom-0 left-0 right-0 p-4">
			<button class="w-full h-[44px] bt-brand !text-base !rounded-lg" @click="goback">返回</button>
		</div>
	</div>
</template>
