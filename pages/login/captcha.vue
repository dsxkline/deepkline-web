<script setup lang="ts">
	import { useStore } from '~/store'

	const props = defineProps<{
		email: string
		successCallback: (code: string) => Promise<boolean>
	}>()
	const input1 = ref()
	const input2 = ref()
	const input3 = ref()
	const input4 = ref()
	const code1 = ref('')
	const code2 = ref('')
	const code3 = ref('')
	const code4 = ref('')

	const loading = ref(false)
	const error = ref('')

	const keystr = ref('')

	function inputHandle(e: KeyboardEvent, code: Ref, input: Ref, nextInput: Ref, preInput: Ref) {
		//console.log('key',e)
		let key = e?.key
		keystr.value = key
		// console.log('keykey',e.code,e.charCode,e.keyCode,e.metaKey,e.location,input.value.value,code.value)
		if (key == 'Process') return
		// 判断是否是字母或数字
		if (/^[a-zA-Z0-9]$/.test(key)) {
			code.value = key
			setTimeout(() => {
				nextInput.value?.focus()
			}, 10)
		} else {
			// 删除键
			if (key === 'Delete' || key === 'Backspace') {
				code.value = ''
				setTimeout(() => {
					preInput.value?.focus()
				}, 10)
			} else {
				if (key === 'Unidentified') {
					setTimeout(() => {
						if (code.value) nextInput.value?.focus()
					}, 10)
				}
			}
		}
	}

	function inputHandle1(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code1, input1, input2, input1)
	}
	function inputHandle2(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code2, input2, input3, input1)
	}
	function inputHandle3(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code3, input3, input4, input2)
	}
	function inputHandle4(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code4, input4, input4, input3)
		next()
	}

	function next() {
		if (!(code1.value && code2.value && code3.value && code4.value)) {
			return
		}
		keystr.value = ''
		error.value = ''
		loading.value = true
		console.log('code...', code1.value, code2.value, code3.value, code4.value, props.successCallback)
		props.successCallback &&
			props
				.successCallback(code1.value + code2.value + code3.value + code4.value)
				.then(success => {
					loading.value = false
					useNuxtApp().$pop()
				})
				.catch(err => {
					console.log('err', err)
					setTimeout(() => {
						loading.value = false
						error.value = err.message || '网络异常，请稍后再试'
					}, 500)
				})
	}

	onMounted(() => {
		setTimeout(() => {
			input1.value?.focus()
		}, 500)
	})
	onUnmounted(() => {})
</script>
<template>
	<div class="login-index-container">
		<NavigationBar ref="navbar">
			<template #right>
				<button class="flex items-center p-2">
					<el-icon class="!w-5 !h-5"><Service class="!w-5 !h-5" /></el-icon>
				</button>
			</template>
		</NavigationBar>
		<h1 class="px-6 text-2xl font-bold pt-4 text-center">
			输入邮箱验证码
			<p class="text-sm font-normal text-grey py-1">邮箱验证码已发送到 {{ email }}</p>
		</h1>

		<div class="global-form p-6">
			<div class="form-item my-4 justify-between !flex-row flex *:!w-[60px]">
				<el-input v-model="code1" size="large" maxlength="1" ref="input1" @keydown="inputHandle1" inputmode="numeric" autocomplete="one-time-code" />
				<el-input v-model="code2" size="large" maxlength="1" ref="input2" @keydown="inputHandle2" inputmode="numeric" />
				<el-input v-model="code3" size="large" maxlength="1" ref="input3" @keydown="inputHandle3" inputmode="numeric" />
				<el-input v-model="code4" size="large" maxlength="1" ref="input4" @keydown="inputHandle4" inputmode="numeric" />
			</div>
			<div class="flex justify-between items-center text-grey text-sm">
				<div class="text-red">
					<span v-if="!keystr && error">{{ error }}</span>
				</div>
				<div class="">重新发送验证码</div>
			</div>

			<div class="form-item mt-8">
				<el-button
					:loading="loading"
					@click="next"
					:class="[
						'w-full transition-all !py-3 !h-auto !text-sm bt-default',
						code1 && code2 && code3 && code4 ? '!bg-brand !text-white' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]'
					]"
				>
					下一步
				</el-button>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	:deep(.el-input) {
		.el-input__inner {
			text-align: center;
			height: 60px;
			@apply !text-2xl;
		}
	}
</style>
