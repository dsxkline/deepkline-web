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
		<EmptyIcon class=" w-52" />
		<p class="text-sm text-grey mt-[-20px]">{{ content}}</p>
        <div class="py-3 pb-16">
			<slot />
		</div>
	</div>
</template>
