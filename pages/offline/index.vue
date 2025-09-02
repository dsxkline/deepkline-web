<template>
	<div class="offline-page">
		<h1>离线模式</h1>
		<p>您当前没有网络连接，请稍后再试。</p>
	</div>
</template>

<script setup lang="ts">
	// 这里可以放一些离线状态逻辑，如果需要的话
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
