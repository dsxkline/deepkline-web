<script lang="ts" setup>
	import { usePush, usePushUp } from '~/composable/usePush'
	import { useUserStore } from '~/store/user'
	import AddAccount from '../account/open-account.vue'
	import type { ExchangeDto } from '~/fetch/dtos/exchange.dto'
	import LoginIndex from '../login/index.vue'
	import { useAccountStore } from '~/store/account'
	import CreateDemo from '../account/open-demo.vue'
	import type { ComponentInternalInstance } from 'vue/dist/vue.js'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	const { t } = useI18n()
	const props = defineProps<{
		height: number
	}>()
	const loading = ref(false)
	const error = ref('')
	const pushLeft = usePush()
	const pushUp = usePushUp()
	const exchanges = computed(() => useAccountStore().exchanges)
	// 如果是dialog打开
	const currentDialog: ComponentInternalInstance | any = inject('currentDialog', null) // 也能拿到
	const pushAddAccount = (exchange: ExchangeDto) => {
		if (!useUserStore().user) {
			pushUp(LoginIndex,{},'100%')
			return
		}
		if (exchange.isLocal && exchange.isDemo) {
			pushLeft(CreateDemo, {}, '100%', currentDialog)
		}
		pushLeft(
			AddAccount,
			{
				exchange: exchange
			},
			'100%',
			currentDialog
		)
	}
	const pushAddDemoAccount = () => {
		if (!useUserStore().user) {
			pushUp(LoginIndex,{},'100%')
			return
		}
		pushLeft(CreateDemo, {}, '100%', currentDialog)
	}

	function getExchanges() {
		if (loading.value) return
		loading.value = true
		exchangeFetch
			.list()
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					const exchanges = result.data
					if (exchanges) {
						useAccountStore().setExchanges(exchanges)
					}
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = t('网络异常，请稍后再试')
			})
	}

	onMounted(() => {
		getExchanges()
	})
</script>
<template>
	<div class="exchange-list-container">
		<Empty :content="t('暂无数据')" v-if="!loading && !error && !exchanges?.length" class="pt-20">
			<template #default>
				<el-button @click.stop="getExchanges">{{ t('重新加载') }}</el-button>
			</template>
		</Empty>
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getExchanges">{{ t('重新加载') }}</el-button>
			</template>
		</Error>
		<ul class="p-4 flex flex-col *:rounded-2xl *:overflow-hidden *:p-4 *:my-4 *:border *:border-[--transparent05]" v-if="loading && !error">
			<li class="border-b border-[--transparent05] py-3" v-for="item in 5">
				<div class="flex justify-between">
					<div class="flex items-center w-full">
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 18px" />
							</template>
						</el-skeleton>
					</div>
					<div class="flex justify-between items-center gap-4"></div>
				</div>
				<div class="py-0 flex items-center">
					<el-skeleton :rows="0" animated class="flex items-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 30%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
					<el-skeleton :rows="0" animated>
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-right">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="flex items-center gap-2 justify-between *:flex-1"></div>
			</li>
		</ul>
		<ul class="p-4 flex flex-col *:rounded-2xl *:overflow-hidden *:p-4 *:my-4 *:border *:border-[--transparent05]" v-if="!loading && !error && exchanges?.length">
			<template v-for="item in exchanges">
				<li :class="[item.slug + '-card']" @click="pushAddAccount(item)">
					<div class="flex">
						<ExchangeLogo :exchange="item.slug" class="w-12 h-12" />
						<div class="flex flex-col px-2 flex-1">
							<b class="text-xl">{{ item.name }}</b>
							<span class="text-sm text-grey">{{ item.description }}</span>
						</div>
					</div>
					<div class="py-4">
						<dl class="text-sm flex items-center justify-between *:flex *:flex-col [&_span]:text-xs [&_span]:text-grey [&_b]:text-center">
							<dt>
								<b>${{ item.minDeposit }}</b>
								<span>{{ t('最小入金') }}</span>
							</dt>
							<dt>
								<b>{{ item.maxLeverage }}:1</b>
								<span>{{ t('最大杠杆') }}</span>
							</dt>
							<dt>
								<b>{{ item.takerFee }}%</b>
								<span>{{t('手续费')}}</span>
							</dt>
						</dl>
					</div>
					<div>
						<button :class="['exchange-open-bt bt-default w-full h-10 !text-sm !border-0', item.slug + '-bt']" @click="pushAddAccount(item)">
							{{ item.isLocal && item.isDemo ? t('开设模拟账户') : t('开设账户') }}
						</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.exchange-list-container {
			.exchange-open-bt {
				background-color: white;
			}
		}
	}

	.exchange-list-container {
		container-type: inline-size; /* 启用容器查询 */
		ul {
			@apply grid grid-cols-2 gap-3;
		}
	}

	@container (max-width: 500px) {
		.exchange-list-container {
			ul {
				display: flex!important;
			}
		}
	}

	@media (max-width: 999px) {
		.exchange-list-container {
			ul {
				@apply flex;
			}
		}
	}
</style>
