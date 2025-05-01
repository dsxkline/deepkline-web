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
    background-color: var(--transparent05);
}
</style>