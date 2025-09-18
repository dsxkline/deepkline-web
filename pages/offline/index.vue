<template>
	<div class="offline-page">
		<h1>{{ t('离线模式') }}</h1>
		<p>{{t('您当前没有网络连接，请稍后再试')}}</p>
	</div>
</template>

<script setup lang="ts">
	const { t } = useI18n()
</script>

<style scoped>
	.offline-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}
</style>
