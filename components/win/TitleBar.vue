<script setup lang="ts">
	import { useStore } from '~/store'
	const titleBar = ref()
	onMounted(() => {
		nextTick(() => {
			titleBar.value.clientHeight && document.documentElement.style.setProperty('--title-bar-height', `${titleBar.value.clientHeight}px`)
		})
	})
</script>
<template>
	<div class="title-bar h-[25px] glass px-2" ref="titleBar">
		<div class="flex items-center h-full">
			<!-- logo -->
			<div class="flex items-center justify-center w-[18px] h-[18px] mr-1" v-if="useStore().theme == 'dark'">
				<img src="~/assets/images/logo.png" alt="logo" class="w-[15px] h-[15px] rounded-full" />
			</div>
			<div class="flex items-center justify-center w-[18px] h-[18px] mr-1" v-else>
				<img src="~/assets/images/logo.png" alt="logo" class="w-[15px] h-[15px] rounded-full" />
			</div>
			<b class="logo-text mr-2 font-mono text-xs text-main"> DeepKline is the most silky cryptocurrency trading system. </b>
		</div>
		<div>
			<!--  -->
		</div>
		<div>
			<!--  -->
		</div>
	</div>
</template>

<style lang="less">
	.title-bar {
		-webkit-app-region: drag; /* 允许拖动窗口 */
		position: relative;
		&::before {
			// background-image: linear-gradient(90deg, #00dc82, #36e4da, #0047e1);
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			// border-radius: 999px;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.5;
			// transition: all 0.3s ease;
		}
	}
    @media (max-width:999px) {
        .title-bar{
            .logo-text{
                display: none;
            }
        }
    }
</style>
