<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
	<div class="face-container w-full h-auto flex items-center justify-center">
		<div class="face-content flex items-center justify-center flex-col p-4">
			<div class="face-icon flex items-center justify-center relative overflow-hidden rounded-xl">
				<img src="~/assets/images/logo.png" alt="Face Icon" class="w-16 h-16" />
				<div class="progress-bar"></div>
			</div>
			<div class="face-text mt-4 text-center text-main text-lg font-semibold">DeepKline</div>
			<div class="face-button mt-1 text-muted text-sm">{{ t('口号') }}</div>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.progress-bar {
		position: absolute;
		animation: shine 1.5s ease-in-out 0s;
		top: 0;
		width: 200%;
		height: 300%;
		content: '';
		background: linear-gradient(to right, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%);
		transform: skewX(-45deg);
		animation-iteration-count: infinite;
	}

	@keyframes shine {
		0% {
			left: -200%;
            top: -200%;
		}
		100% {
			left: 150%;
            top: 120%;
		}
	}
</style>
