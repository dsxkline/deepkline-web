<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.d'
	import { userFetch } from '~/fetch/user.fetch'

	const props = defineProps<{
		email: string
		successCallback: (code: string) => Promise<boolean>
		resetCallback: () => Promise<void>
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
	let timer: NodeJS.Timeout | null = null
	const timemout = 30
	const second = ref(timemout)

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
						if (code.value) {
							nextInput.value?.focus()
							if (nextInput == input4) {
								next()
							}
						}
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
		const code = code1.value + code2.value + code3.value + code4.value
		console.log('code...', code, props.successCallback)
		// 校验验证码是否正确
		userFetch
			.checkVerificationCode(props.email, code)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					const validId = result.data?.validId
					if (validId) {
						props.successCallback &&
							props
								.successCallback(validId)
								.then(success => {
									loading.value = false
								})
								.catch(err => {
									console.log('err', err)
									setTimeout(() => {
										loading.value = false
										error.value = err.message || '网络异常，请稍后再试'
									}, 500)
								})
					}
				} else {
					setTimeout(() => {
						loading.value = false
						error.value = result?.msg || '网络异常，请稍后再试'
					}, 500)
				}
			})
			.catch(err => {
				console.log('err', err)
				setTimeout(() => {
					loading.value = false
					error.value = err.message || '网络异常，请稍后再试'
				}, 500)
			})
	}

	function reset() {
		code1.value = ''
		code2.value = ''
		code3.value = ''
		code4.value = ''
		keystr.value = ''
		error.value = ''
		loading.value = true
		console.log('code...', code1.value, code2.value, code3.value, code4.value, props.successCallback)
		props.resetCallback &&
			props
				.resetCallback()
				.then(() => {
					loading.value = false
				})
				.catch(err => {
					console.log('err', err)
					setTimeout(() => {
						loading.value = false
						error.value = err.message || '网络异常，请稍后再试'
					}, 500)
				})
	}

	function resetStart() {
		createTimer()
	}

	function createTimer() {
		clearTimer()
		second.value = timemout
		timer = setInterval(() => {
			second.value--
		}, 1000)
	}
	function clearTimer() {
		if (timer) clearInterval(timer)
	}

	onMounted(() => {
		createTimer()
		setTimeout(() => {
			input1.value?.focus()
		}, 600)
	})
	onUnmounted(() => {
		clearTimer()
	})

	defineExpose({
		resetStart
	})
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
				<div class="" @click="reset" v-if="second <= 0">重新发送验证码</div>
				<div class="" v-if="second > 0">{{ second }}秒后重新发送</div>
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
