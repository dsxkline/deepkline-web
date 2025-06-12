<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import { useUserStore } from '~/store/user'
	import AddAccount from '../account/add-account.vue'
	import type { ExchangeDto } from '~/fetch/dtos/exchange'

	const props = defineProps<{
		height: number
	}>()
	const pushLeft = usePush()
	const exchanges = computed(() => useUserStore().exchanges)
	const pushAddAccount = (exchange: ExchangeDto) => {
		pushLeft(AddAccount, {
			exchange: exchange
		})
	}
</script>
<template>
	<div class="exchange-list-container">
		<ScrollBar class="w-full h-full" :height="height + 'px'" :always="false">
			<ul class="p-4 flex flex-col *:rounded-2xl *:overflow-hidden *:p-4 *:my-4 *:border *:border-[--transparent10]">
				<template v-for="item in exchanges">
					<li>
						<div class="flex">
							<ExchangeLogo :exchange="item.slug" class="w-12 h-12" />
							<div class="flex flex-col px-2">
								<b class="text-xl">{{ item.name }}</b>
								<span class="text-sm">okx是简单易用经纪商</span>
							</div>
						</div>
						<div class="py-4">
                            <dl class="text-xl flex items-center justify-between *:flex *:flex-col [&_span]:text-sm [&_b]:text-center">
                                <dt>
                                    <b>$0</b>
                                    <span>最小入金</span>
                                </dt>
                                <dt>
                                    <b>125:1</b>
                                    <span>最大杠杆</span>
                                </dt>
                                <dt>
                                    <b>$0</b>
                                    <span>费用</span>
                                </dt>
                            </dl>
                        </div>
						<div>
							<button class="exchange-open-bt bt-default w-full h-10 !rounded-full !text-base border" @click="pushAddAccount(item)">开设账户</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.exchange-open-bt {
            background-color: white;
		}
	}
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
