<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import AccountHelp from './account-help.vue'
	import { usePush } from '~/composable/usePush'
	import Select from '~/components/app/Select.vue'
	import { useUserStore } from '~/store/user'
	import { accountFetch } from '~/fetch/account.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import type { ExchangeDto } from '~/fetch/dtos/exchange'
	import { Link } from '@element-plus/icons-vue'
	const props = defineProps<{
		push?: boolean
		exchange: ExchangeDto
	}>()
	const pushLeft = usePush()
	const exchanges = computed(() => useUserStore().exchanges)
	const exchange = ref(props.exchange)
	const apiKey = ref('')
	const secretKey = ref('')
	const passPhrase = ref('')
	const apiKeyInput = ref()
	const secretKeyInput = ref()
	const passInput = ref()
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const next = () => {
		if (loading.value) return
		loading.value = true
		error.value = ''
		accountFetch
			.connect(props.exchange.slug, apiKey.value, secretKey.value, passPhrase.value)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					loading.value = false
				} else {
					setTimeout(() => {
						loading.value = false
						error.value = result?.msg
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					loading.value = false
					error.value = '网络异常，请稍后再试'
				}, 500)
			})
	}

	async function pastedHandle(type: number) {
		try {
			const text = await navigator.clipboard.readText()
			if (type == 0) apiKey.value = text
			if (type == 1) secretKey.value = text
			if (type == 2) passPhrase.value = text
		} catch (err) {
			console.log('paste error', err)
		}
	}
	function pushHelp() {
		pushLeft(AccountHelp)
	}

	function openExchange() {
		window.open(exchange.value.website, '_blank')
	}

	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="连接账户" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2" @click="pushHelp">
					<HelpIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }" :always="false">
			<div class="global-form p-4">
				<!-- <div class="form-item">
					<label>选择交易所</label>
					<Select v-model="exchange">
						<template #name>
							<div class="flex items-center">
								<img :src="useUserStore().getExchange(exchange.slug)?.logoUrl" v-if="useUserStore().getExchange(exchange.slug)?.logoUrl" class="w-5 h-5 mr-2 rounded-full" />
								<ExchangeLogo :exchange="exchange.slug" class="w-5 h-5 mr-2" v-else />
								<span class="text-base font-bold">{{ exchange.name }}</span>
							</div>
						</template>
						<SelectOption v-for="item in exchanges" :key="item.slug" :value="item">
							<div class="flex items-center">
								<img :src="useUserStore().getExchange(exchange.slug)?.logoUrl" v-if="useUserStore().getExchange(exchange.slug)?.logoUrl" class="w-5 h-5 mr-2 rounded-full" />
								<ExchangeLogo :exchange="item.slug" class="w-5 h-5 mr-2" v-else /><span class="text-base font-bold">{{ item.name }}</span>
							</div>
						</SelectOption>
					</Select>
				</div> -->
				<div>
					<div class="exchange-card flex rounded-2xl overflow-hidden p-4 mb-4 border border-[--transparent10]">
						<ExchangeLogo :exchange="exchange.slug" class="w-12 h-12" />
						<div class="flex flex-col px-2">
							<b class="text-xl">{{ exchange.name }}</b>
							<span class="text-sm text-grey">okx是简单易用经纪商</span>
						</div>
					</div>
				</div>
				<div class="form-item py-3 text-xs flex !flex-row leading-none justify-between">
					请在 {{ exchange.name }} 创建 API 密钥，并粘贴至此处
					<span class="px-2 text-brand flex items-center justify-center leading-none" @click="pushHelp"
						>教程<el-icon class="ml-1"><ArrowRight /></el-icon
					></span>
				</div>
				<div class="form-item my-2" v-if="exchange.apiKeyRequired">
					<label>API Key</label>
					<el-input ref="apiKeyInput" v-model="apiKey" :placeholder="'请粘贴 ' + exchange.name + ' 交易所API Key'" size="large" clearable>
						<template #suffix>
							<button @click="pastedHandle(0)"><PastedIcon class="w-5" /></button>
						</template>
					</el-input>
				</div>
				<div class="form-item my-2" v-if="exchange.secretKeyRequired">
					<label>Secret Key</label>
					<el-input ref="secretKeyInput" v-model="secretKey" :placeholder="'请粘贴 ' + exchange.name + ' 交易所 Secret Key'" size="large" clearable>
						<template #suffix>
							<button @click="pastedHandle(1)"><PastedIcon class="w-5" /></button>
						</template>
					</el-input>
				</div>
				<div class="form-item my-2" v-if="exchange.passphraseRequired">
					<label>Passphrase</label>
					<el-input ref="passInput" v-model="passPhrase" :placeholder="'请粘贴 ' + exchange.name + ' 交易所 Passphrase'" size="large" clearable>
						<template #suffix>
							<button @click="pastedHandle(2)"><PastedIcon class="w-5" /></button>
						</template>
					</el-input>
				</div>

				<div class="form-item py-3 text-xs *:flex *:items-center *:py-1 [&_i]:mr-1">
					<h3 class="text-sm">权限要求:</h3>
					<p>
						<el-icon class="!text-green"><SuccessFilled /></el-icon>读取(必须)
					</p>
					<p>
						<el-icon class="!text-green"><SuccessFilled /></el-icon>交易(建议)
					</p>
					<p>
						<el-icon class="!text-red"><RemoveFilled /></el-icon>不勾选“提现权限”！为了您的资产安全
					</p>
				</div>

				<div class="form-item mt-3">
					<el-button size="large" :class="['w-full transition-all !py-3 !h-auto !text-base bt-default', '!bg-brand !text-white']" @click="next" :loading="loading">连接</el-button>
				</div>
				<div class="flex justify-center py-3 text-grey text-sm">
					<span>或者</span>
				</div>
				<div class="form-item mt-0">
					<el-button size="large" :class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', '!bg-[--transparent02] !text-main']" @click="openExchange"
						>去 {{ exchange.name }} 开设新账户 <el-icon class="ml-1"><Link /></el-icon
					></el-button>
				</div>
			</div>
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.exchange-card {
			border: none;
			&::before {
				opacity: 1;
			}
		}
	}

	.global-form {
		.form-item {
			label {
				@apply text-main;
			}
		}
	}

	.exchange-card {
		position: relative;
		&::before {
			// background-image: linear-gradient(90deg, #00dc82, #36e4da, #0047e1);
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.2;

			// transition: all 0.3s ease;
		}
	}
</style>
