<script lang="ts" setup>

</script>
<template>
    <div class="main-container flex flex-row justify-between">
        <LeftMenu></LeftMenu>
        <SplitContainer>
            <template #right>
                <KlineChart></KlineChart>
            </template>
        </SplitContainer>
        
    </div>
</template>

<style>

</style>