<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import type { AccountDto } from '~/fetch/dtos/account.d'
	import { useStore } from '~/store'
	import AddAccount from './add-account.vue'
	import AccountHelp from './account-help.vue'
	import { useUserStore } from '~/store/user'
	const props = defineProps<{
		push?: boolean
	}>()
	const pushLeft = usePush()
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
	function pushAddAccount() {
		pushLeft(AddAccount)
	}
	function pushHelp() {
		pushLeft(AccountHelp)
	}
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="账号列表" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2" @click="pushHelp">
					<HelpIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>

		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--nav-height) - 60px)' }" :always="false">
			<ul class="account-list mt-4 px-4 *:flex *:items-center *:py-3 [&_b]:flex [&_b]:items-center *:border *:border-[--transparent10] *:rounded-xl *:mb-4 *:px-2 *:relative">
				<template v-for="item in accounts">
					<li :class="[item.isCurrent ? 'active' : '']">
						<img :src="useUserStore().getExchange(item.exchange)?.logoUrl" v-if="useUserStore().getExchange(item.exchange)?.logoUrl" class="w-10 h-10 rounded-full" />
						<ExchangeLogo :exchange="item.exchange" class="w-10 h-10" v-else />
						<div class="flex flex-col px-2 justify-center">
							<b class="text-xl flex items-center leading-none mb-1"
								>{{ useUserStore().getExchange(item.exchange)?.name || item.exchange }} <span class="text-base px-1 font-normal">({{ phoneStar(item.accountId + '') }})</span></b
							>
							<div class="text-xs">
								<span>{{ item.accountId }} USDT</span>
								<span class="text-green"> +265.36 USDT / +12.30%</span>
							</div>
						</div>
						<span v-if="item.isCurrent" class="current-item absolute right-0 top-0 text-xs px-3 bg-brand text-white rounded-bl-xl rounded-tr-lg">当前使用中</span>
					</li>
				</template>
			</ul>
		</ScrollBar>
		<div class="w-full px-4 pt-[20px] pb-[40px]">
			<button @click="pushAddAccount" class="add-account-bt rounded-full h-[var(--nav-height)] w-full border border-[--transparent10]"><b>+ 绑定新账号</b></button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.account-list {
			.active {
				border-color: rgb(var(--color-text-main));
				&::before {
					background-image: none;
				}
				.current-item {
					background-color: rgb(var(--color-text-main));
				}
			}
		}
		.add-account-bt {
			&::before {
				background-image: none;
			}
		}
	}
	.account-list {
		.active {
			border-color: rgb(var(--color-brand));
			&::before {
				background-image: var(--bg-linear-90);
				// filter: blur(60px);
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				content: '';
				z-index: -1;
				opacity: 0.1;
			}
		}
	}
	.add-account-bt {
		position: relative;
		&::before {
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.1;
			border-radius: 999px;
		}
	}
</style>
