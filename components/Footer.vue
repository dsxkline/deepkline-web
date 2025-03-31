<template>
    <div class="footer border-b w-full flex items-center">
        <SymbolTitle />
        <SymbolTools />
        <CycleBar />
        <Indicator />
    </div>
</template>
<style lang="less" scoped>
.footer {
    height: var(--footer-height);
    background-color: var(--transparent02);
    border-color: var(--transparent03);
}
</style>