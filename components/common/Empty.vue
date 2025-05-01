<script setup lang="ts">
const props = defineProps({
    content: {
        type: String,
        default: 'No Data'
    }
})
</script>
<template>
	<div class="empty-container w-full h-full flex flex-col items-center justify-center">
		<EmptyIcon />
		<p class="text-sm text-grey">{{ content}}</p>
	</div>
</template>
