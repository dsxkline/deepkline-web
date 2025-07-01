<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import  {type AccountDto, AccountEnvType } from '~/fetch/dtos/account.d'
	import { useStore } from '~/store'
	import ExchangeIndex from '../exchange/index.vue'
	import AccountHelp from './account-help.vue'
	import { useUserStore } from '~/store/user'
	import { accountFetch } from '~/fetch/account.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { useAccountStore } from '~/store/account'
	const props = defineProps<{
		push?: string
	}>()
	const pushLeft = usePush()
	const loading = ref(true)
	const error = ref<string | undefined>('')
	const accounts = ref<AccountDto[] | null>([])
	function getAccounts() {
		if (loading.value) return
		loading.value = true
		error.value = ''
		accountFetch
			.list()
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false

					accounts.value = result.data
				} else {
					loading.value = false
					error.value = result?.msg
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					error.value = '网络异常，请稍后再试'
				}, 500)
			})
	}
	function pushAddAccount() {
		pushLeft(ExchangeIndex)
	}
	function pushHelp() {
		pushLeft(AccountHelp)
	}
	onMounted(() => {
		loading.value = false
		getAccounts()
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="账户列表" :hideBack="push != 'rtl'">
			<template #right>
				<button class="flex items-center p-2 px-4" @click="pushHelp">
					<HelpIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>

		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(100% - var(--nav-height) - var(--nav-height) - 60px)' }" :always="false">
			<Error :content="error" v-if="!loading && error">
				<template #default>
					<el-button @click.stop="getAccounts()">点击刷新</el-button>
				</template>
			</Error>

			<Empty :content="'开设新账户，体验一键速达全球交易！'" v-if="!loading && !error && !accounts?.length"> </Empty>

			<ul class="account-list mt-4 px-4 flex flex-col *:border *:border-[--transparent10] *:rounded-xl *:mb-4" v-if="loading && !error">
				<li class="w-full flex items-center hover:bg-[--transparent03] px-4 py-3" v-for="item in 3">
					<el-skeleton style="--el-skeleton-circle-size: 40px" animated class="flex-1 pr-2 flex items-center">
						<template #template>
							<el-skeleton-item variant="circle" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="flex flex-col !justify-start">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 24px" />
							<el-skeleton-item variant="p" style="width: 80%; height: 10px" class="mt-1" />
						</template>
					</el-skeleton>
				</li>
			</ul>

			<ul v-if="accounts?.length" class="account-list mt-4 px-4 *:flex *:items-center *:py-3 [&_b]:flex [&_b]:items-center *:border *:border-[--transparent10] *:rounded-xl *:mb-4 *:px-2 *:relative">
				<template v-for="item in accounts">
					<li :class="[item.isCurrent ? 'active' : '']">
						<img :src="useAccountStore().getExchange(item.exchange)?.logoUrl" v-if="useAccountStore().getExchange(item.exchange)?.logoUrl" class="w-10 h-10 rounded-full" />
						<ExchangeLogo :exchange="item.exchange" class="w-10 h-10" v-else />
						<div class="flex flex-col px-2 justify-center">
							<b class="text-xl flex items-center leading-none mb-1">
								{{ useAccountStore().getExchange(item.exchange)?.name || item.exchange }} 
								<span class="text-base px-1 font-normal">({{ phoneStar(item.accountId + '') }})</span>
								<div :class="['tag-'+(item.envType==AccountEnvType.DEMO?'demo':'real')]">{{ (item.envType==AccountEnvType.DEMO?'模拟':'实盘') }}</div>
							</b>
							<div class="text-xs">
								<span>{{ formatPrice(item.total||'0',2) }} USDT</span>
								<ProfitRate :profit="item?.profit" :profitRate="item?.profitRate"/>
							</div>
						</div>
						<span v-if="item.isCurrent" class="current-item absolute right-0 top-0 text-xs px-3 bg-brand text-white rounded-bl-xl rounded-tr-lg">当前使用中</span>
					</li>
				</template>
			</ul>
		</ScrollBar>
		<div class="w-full px-4 pt-[20px] pb-[40px]">
			<button @click="pushAddAccount" class="add-account-bt h-[var(--nav-height)] w-full border border-[--transparent10]"><b>+ 开设新账户</b></button>
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
		border-radius: var(--el-border-radius-base);
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
			border-radius: var(--el-border-radius-base);
		}
	}
</style>
