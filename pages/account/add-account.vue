<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import AccountHelp from './account-help.vue'
	import { usePush } from '~/composable/usePush'
	import Select from '~/components/app/Select.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const pushLeft = usePush()
	const exchanges = ref([
		{
			name: 'okx',
			value: 'okx'
		},
		{
			name: 'binance',
			value: 'binance'
		},
		{
			name: 'coinbase',
			value: 'coinbase'
		}
	])
	const exchange = ref('okx')
	const apiKey = ref('')
	const secretKey = ref('')
	const passPhrase = ref('')
	const loading = ref(false)
	const error = ref<string | undefined>('')
	const next = ()=>{
		
	}
	watch(
		() => exchange.value,
		val => {
			console.log('切换交易所', val, exchange.value)
		}
	)
	function pushHelp() {
		pushLeft(AccountHelp)
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
		<div class="global-form p-6">
			<div class="form-item my-2">
				<Select v-model="exchange" :title="'选择交易所'">
					<SelectOption v-for="item in exchanges" :key="item.value" :value="item.value">
						<div class="flex items-center"><ExchangeLogo :exchange="item.value" class="w-5 h-5 mr-2" /><span class="text-base font-bold">{{ item.name }}</span></div>
					</SelectOption>
				</Select>
			</div>
			<div class="form-item py-3 text-xs">
				请在 {{ exchange }} 创建 API 密钥，并将以下信息粘贴至此处
			</div>
			<div class="form-item my-2">
				<label>API Key</label>
				<el-input ref="apiKeyInput" v-model="apiKey" :placeholder="'请粘贴 '+exchange+' 交易所API Key'" size="large" clearable></el-input>
			</div>
			<div class="form-item my-2">
				<label>Secret Key</label>
				<el-input ref="secretKeyInput" v-model="secretKey" :placeholder="'请粘贴 '+exchange+' 交易所 Secret Key'" size="large" clearable></el-input>
			</div>
			<div class="form-item my-2">
				<label>Passphrase</label>
				<el-input ref="passInput" v-model="passPhrase" :placeholder="'请粘贴 '+exchange+' 交易所 Passphrase'" size="large" clearable></el-input>
			</div>

			<div class="form-item py-3 text-xs *:flex *:items-center *:py-1 [&_i]:mr-1">
				<h3 class="text-sm">权限要求:</h3>
				<p><el-icon class="!text-green"><SuccessFilled/></el-icon>读取(必须)</p>
				<p><el-icon class="!text-green"><SuccessFilled /></el-icon>交易(建议)</p>
				<p><el-icon class="!text-red"><RemoveFilled /></el-icon>不勾选“提现权限”！为了您的资产安全</p>
			</div>

			<div class="form-item mt-8">
				<el-button
					size="large"
					:class="['w-full transition-all !py-3 !h-auto !text-sm bt-default', apiKey && secretKey ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']"
					@click="next"
					:loading="loading"
					>确定</el-button
				>
			</div>
		</div>
	</div>
</template>
