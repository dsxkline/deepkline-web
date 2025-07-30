<script setup lang="ts">
	const props = defineProps<{
		profit?: number
		profitRate?: number
	}>()
</script>
<template>
	<span>
		<span :class="['', 'text-' + ((profit && profit > 0) || (profitRate && profitRate > 0) ? 'green' : 'red')]" v-if="profit || profitRate">
			<template v-if="profit != undefined"> {{ profit && profit > 0 ? '+' : '' }}{{ formatNumber(profit, '2') }} </template>
			<template v-if="profitRate != undefined"> ({{ profitRate && profitRate > 0 ? '+' : '' }}{{ formatNumber(profitRate * 100, '2') }}%) </template>
		</span>
		<span v-else class="text-main">
			<template v-if="profit != undefined">+0.00</template> <template v-else>--</template> <template v-if="profitRate != undefined">(+0.00%)</template> <template v-else>(--%)</template>
		</span>
	</span>
</template>
