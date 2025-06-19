<script lang="ts" setup>
	import { usePush, usePushUp } from '~/composable/usePush'
	import { useUserStore } from '~/store/user'
	import AddAccount from '../account/add-account.vue'
	import type { ExchangeDto } from '~/fetch/dtos/exchange'
    import LoginIndex from '../login/index.vue'
import { useAccountStore } from '~/store/account'

	const props = defineProps<{
		height: number
	}>()
	const pushLeft = usePush()
	const pushUp = usePushUp()
	const exchanges = computed(() => useAccountStore().exchanges)
	const pushAddAccount = (exchange: ExchangeDto) => {
		if (!useUserStore().user) {
			pushUp(LoginIndex)
            return;
		}
		pushLeft(AddAccount, {
			exchange: exchange
		})
	}
</script>
<template>
	<div class="exchange-list-container">
		<ul class="p-4 flex flex-col *:rounded-2xl *:overflow-hidden *:p-4 *:my-4 *:border *:border-[--transparent05]">
			<template v-for="item in exchanges">
				<li :class="[item.slug + '-card']" @click="pushAddAccount(item)">
					<div class="flex">
						<ExchangeLogo :exchange="item.slug" class="w-12 h-12" />
						<div class="flex flex-col px-2">
							<b class="text-xl">{{ item.name }}</b>
							<span class="text-sm text-grey">okx是简单易用经纪商</span>
						</div>
					</div>
					<div class="py-4">
						<dl class="text-sm flex items-center justify-between *:flex *:flex-col [&_span]:text-xs [&_span]:text-grey [&_b]:text-center">
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
						<button :class="['exchange-open-bt bt-default w-full h-10 !text-sm !border-0',item.slug+'-bt']" @click="pushAddAccount(item)">开设账户</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
<style lang="less" scoped>
	.light {
		.exchange-list-container {
			.exchange-open-bt {
				background-color: white;
			}
		}
	}
</style>
