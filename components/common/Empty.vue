<script setup lang="ts">
const props = defineProps({
    content: {
        type: String,
        default: 'No Data'
    }
})
const slots = useSlots()
</script>
<template>
	<div class="empty-container w-full h-full flex flex-col items-center justify-center">
		<EmptyIcon class=" w-[150px]" />
		<p class="text-sm text-grey">{{ content}}</p>
        <div class="py-3 pb-16" v-if="slots.default">
			<slot />
		</div>
	</div>
</template>
