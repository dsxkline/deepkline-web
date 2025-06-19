<script setup lang="ts">
	import { useAccountStore } from '~/store/account'

	const balance = computed(() => {
		return useAccountStore().balance
	})
	const upl = computed(() => {
		return parseFloat(balance?.value?.upl || '0')
	})
</script>
<template>
	<div class="p-3 glass mx-4 rounded-md overflow-hidden relative">
		<div class="flex items-center">
			<span class="pb-1 text-sm text-grey">总资产(USDT)</span>
		</div>
		<b v-autosize="25" :class="'roboto-bold flex items-end '" v-if="balance">
			<NumberIncrease :value="formatPrice(parseFloat(balance?.totalEq || '0'), 0.01)" unit="" :fontSize="25" />
		</b>
		<div class="text-sm pt-1 text-grey"><span>收益</span><span class="px-1 text-red"> - $70.67 (-33.28%)</span></div>
	</div>
</template>
