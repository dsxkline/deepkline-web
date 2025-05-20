<template>
    <div class="status-bar border-t border-[--border-color] w-full flex items-center justify-between text-xs">
        <div></div>
        <div></div>
        <div>
            <SignalState />
        </div>
    </div>
</template>
<style lang="less" scoped>
.status-bar {
    height: var(--status-bar-height);
    position:relative;
    &::before {
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.1;
		}
}
</style>