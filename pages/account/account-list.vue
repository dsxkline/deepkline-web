<script lang="ts" setup>
	import type { AccountDto } from '~/fetch/dtos/account.d'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?: boolean
	}>()
	const accounts = computed(
		() =>
			[
				{
					exchange: 'okx',
					accountId: 123456,
					isCurrent: true,
					bindTime: '2025-06-08 12:33:21',
					accountName: 'new hans'
				},
				{
					exchange: 'binance',
					accountId: 123456,
					isCurrent: false,
					bindTime: '2025-06-08 12:33:21',
					accountName: 'new hans'
				},
				{
					exchange: 'coinbase',
					accountId: 123456,
					isCurrent: false,
					bindTime: '2025-06-08 12:33:21',
					accountName: 'new hans'
				}
			] as AccountDto[]
	)
	function pushAddAccount() {}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="账号列表" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2" @click="pushAddAccount">
					<HelpIcon class="w-5 h-5"/>
				</button>
			</template>
		</NavigationBar>

		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--nav-height) - 40px)' }" :always="false">
			<ul class="mt-4 px-4 *:flex *:items-center *:py-3 [&_b]:flex [&_b]:items-center *:border *:rounded-xl *:mb-4 *:px-2 *:relative">
				<template v-for="item in accounts">
					<li :class="[item.isCurrent?'border-[rgb(var(--color-brand))]':'']">
						<ExchangeLogo :exchange="item.exchange" />
						<div class="flex flex-col px-2 justify-center">
							<b class="text-xl flex items-center leading-none mb-1"
								>{{ item.exchange }} <span class="text-base px-1 font-normal">({{ phoneStar(item.accountId+'') }})</span></b
							>
							<div class="text-xs">
								<span>{{ item.accountId }} USDT</span>
								<span class="text-green">+265.36 USDT / +12.30%</span>
							</div>
						</div>
						<span v-if="item.isCurrent" class="absolute right-0 top-0 text-xs px-3 bg-brand text-white rounded-bl-xl rounded-tr-xl">当前使用中</span>
					</li>
				</template>
			</ul>
		</ScrollBar>
        <div class="w-full px-4"><button class="rounded-full h-[var(--nav-height)] w-full border my-[20px]">+ 绑定新账号</button></div>
	</div>
</template>
