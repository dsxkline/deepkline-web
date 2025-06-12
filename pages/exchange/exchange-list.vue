<script lang="ts" setup>
	import { usePush } from '~/composable/usePush';
import { useUserStore } from '~/store/user'
import AddAccount from '../account/add-account.vue';
import type { ExchangeDto } from '~/fetch/dtos/exchange';

	const props = defineProps<{
		height: number
	}>()
    const pushLeft = usePush()
	const exchanges = computed(() => useUserStore().exchanges)
    const pushAddAccount = (exchange:ExchangeDto)=>{
        pushLeft(AddAccount,{
            exchange:exchange
        })
    }
</script>
<template>
	<div class="exchange-list-container">
		<ScrollBar class="w-full h-full" :height="height + 'px'" :always="false">
			<ul class="p-4 flex flex-col *:rounded-2xl *:overflow-hidden *:p-4 *:my-4">
				<template v-for="item in exchanges">
					<li>
						<div class="flex">
							<ExchangeLogo :exchange="item.slug" class="w-14" />
							<div class="flex flex-col px-2">
								<b class="text-2xl">{{ item.name }}</b>
								<span>okx是简单易用经纪商</span>
							</div>
						</div>
						<div class="py-2">介绍</div>
						<div>
							<button class="bt-default w-full h-10 !rounded-full !bg-white !text-invert !text-base" @click="pushAddAccount(item)">开设账户</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped>
	.exchange-list-container {
		ul {
			li {
				position: relative;
				&::before {
					// background-image: linear-gradient(90deg, #00dc82, #36e4da, #0047e1);
					background-image: var(--bg-linear-90);
					// filter: blur(60px);
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					content: '';
					z-index: -1;
					opacity: 0.2;

					// transition: all 0.3s ease;
				}
			}
		}
	}
</style>
