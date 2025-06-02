<script setup lang="ts">
	import { useStore } from '~/store'

	const props = defineProps<{
		email: string
	}>()
	const input1 = ref()
	const input2 = ref()
	const input3 = ref()
	const input4 = ref()
	const code1 = ref('')
	const code2 = ref('')
	const code3 = ref('')
	const code4 = ref('')

	const keystr = ref('')

	function inputHandle(e: KeyboardEvent, code: Ref, nextInput: Ref, preInput: Ref) {
        console.log('key',e)
		let key = e?.key
        keystr.value = key;
        console.log('keykey',e.code,e.charCode,e.keyCode,e.metaKey,e.location)
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
                        if(code.value) preInput.value?.focus()
					}, 10)
				}
			}
		}
	}

	function inputHandle1(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code1, input2, input1)
	}
	function inputHandle2(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code2, input3, input1)
	}
	function inputHandle3(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code3, input4, input2)
	}
	function inputHandle4(e: KeyboardEvent | Event) {
		inputHandle(e as KeyboardEvent, code4, input4, input3)
		next()
	}

	function next() {
		if (code1 && code2 && code3 && code4) {
		}
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
		<NavigationBar ref="navbar" />
		<h1 class="px-6 text-2xl font-bold pt-4 text-center">
			输入验证码
			<p class="text-sm font-normal text-grey py-1">未注册邮箱将自动注册 {{ email }}</p>
		</h1>

		<div class="global-form p-6">
			<div class="form-item my-4 justify-between !flex-row flex *:!w-[60px]">
				<el-input v-model="code1" size="large" maxlength="1" ref="input1" @keydown="inputHandle1" inputmode="numeric" autocomplete="one-time-code" />
				<el-input v-model="code2" size="large" maxlength="1" ref="input2" @keydown="inputHandle2" inputmode="numeric" />
				<el-input v-model="code3" size="large" maxlength="1" ref="input3" @keydown="inputHandle3" inputmode="numeric" />
				<el-input v-model="code4" size="large" maxlength="1" ref="input4" @keydown="inputHandle4" inputmode="numeric" />
			</div>
			{{ keystr }}

			<div class="form-item mt-8">
				<button :class="['w-full transition-all !py-3 !text-sm bt-default', code1 && code2 && code3 && code4 ? '!bg-brand' : ' !text-grey !bg-[--transparent01] !border-[--transparent01]']">
					下一步
				</button>
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
