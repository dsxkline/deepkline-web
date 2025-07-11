<script setup lang="ts">
	const props = defineProps<{
		profit?: number
		profitRate?: number
	}>()
</script>
<template>
	<span>
		<span :class="['', 'text-' + (profit && profit > 0 ? 'green' : 'red')]" v-if="profit">
			<template v-if="profit != undefined"> {{ profit && profit > 0 ? '+' : '' }}{{ profit }} </template>
			<template v-if="profitRate != undefined"> ({{ profit && profit > 0 ? '+' : '' }}{{ profitRate }}%) </template>
		</span>
		<span v-else class="text-main">
            <template v-if="profit != undefined">+0.00</template> <template v-else>--</template> 
            <template v-if="profitRate != undefined">(+0.00%)</template> <template v-else>(--%)</template> 
        </span>
	</span>
</template>
