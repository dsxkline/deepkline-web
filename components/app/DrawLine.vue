<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    methods: {
        clickHandle() {
            this.$emit('click');
        }
    }
});
</script>
<template>
    <div class="h5-draw-line" @click.stop="clickHandle">
            <svg width="41" height="4" viewBox="0 0 41 4" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" width="40" height="4" rx="2" />
      </svg>
    </div>
</template>

<style lang="less" scoped>
.h5-draw-line{
    display: flex;
    left: calc(50% - 20px);
    top: 5px;
    text-align: center;
    align-items: center;
    width: 100%;
    justify-content: center;
    padding: 12px 0;
    svg{
        fill:rgba(0, 0, 0, 0.05)
    }
}
</style>

