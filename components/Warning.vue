<script setup lang="ts">
	import { useSyncedCookie } from '~/composable/useSyncedCookie'

	const isCN = ref(false)
	const hideWarning = computed(() => {
		return !useSyncedCookie('hideWarning').value
	})
	function hide() {
		useSyncedCookie('hideWarning', {
			expires: new Date(new Date().getTime() + 7 * 1000 * 24 * 60 * 60)
		}).value = 'true'
	}

	async function detectMainlandIP() {
		const res = await fetch('https://ipinfo.io/json')
		const data = await res.json()
		console.log(data)
		// data.country = 'CN'
		// data.region = 'Beijing'
		// data.city = 'Beijing'
		isCN.value = data.country === 'CN'
	}

	onMounted(() => {
		detectMainlandIP()
	})
</script>

<template>
	<div
		v-if="hideWarning && isCN"
		class="!fixed w-[90%] max-w-[600px] h-max min-h-[200px] border border-[--transparent20] rounded-2xl p-4 flex flex-col items-center justify-between bg-base text-main top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass"
	>
		<h3 class="text-2xl py-4">温馨提示</h3>
		<p class="text-base">提示：根据相关法律法规，您所在的地区对虚拟货币交易存在限制。请您确保自身操作合法合规，并自行承担相关风险。</p>
		<p class="text-left w-full pt-2 text-sm text-grey">* 受到限制地区会出现网络问题，敬请理解！</p>
		<button class="bt-brand mt-6 mb-1 !text-base min-w-60 h-10" @click="hide">我已知晓</button>
	</div>
</template>
