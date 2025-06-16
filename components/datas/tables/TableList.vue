<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'

	const datas = ref([
		{
			instId: 'BTC-USDT',
			isAccumulating: 10, // 吸筹期
			isMarkingUp: 0, // 拉升期
			isDistributing: 0, // 出货期
			isBullTrap: 0 // 诱多期
		},
		{
			instId: 'ETH-USDT',
			isAccumulating: 0, // 吸筹期
			isMarkingUp: 20, // 拉升期
			isDistributing: 40, // 出货期
			isBullTrap: 0 // 诱多期
		},
		{
			instId: 'SOL-USDT',
			isAccumulating: 0, // 吸筹期
			isMarkingUp: 20, // 拉升期
			isDistributing: 0, // 出货期
			isBullTrap: 20 // 诱多期
		},
		{
			instId: 'TRUMP-USDT',
			isAccumulating: 0, // 吸筹期
			isMarkingUp: 0, // 拉升期
			isDistributing: 60, // 出货期
			isBullTrap: 0 // 诱多期
		},
		{
			instId: 'TIA-USDT',
			isAccumulating: 0, // 吸筹期
			isMarkingUp: 20, // 拉升期
			isDistributing: 0, // 出货期
			isBullTrap: 0 // 诱多期
		},
		{
			instId: 'MEME-USDT',
			isAccumulating: 10, // 吸筹期
			isMarkingUp: 0, // 拉升期
			isDistributing: 0, // 出货期
			isBullTrap: 0 // 诱多期
		},
		{
			instId: 'BTC-USDT',
			isAccumulating: 0, // 吸筹期
			isMarkingUp: 20, // 拉升期
			isDistributing: 0, // 出货期
			isBullTrap: 0 // 诱多期
		}
	])
</script>
<template>
	<div class="py-2">
		<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between">
			<template v-for="item in datas">
				<li>
					<div class="col-span-2">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.instId)" />
					</div>
					<div class="col-span-3 flex-auto grid grid-cols-4 w-full text-[10px] *:py-1 *:rounded-sm *:bg-[--transparent02] *:text-[--transparent10] gap-2">
						<button :class="[item.isAccumulating ? '!bg-brand/30 !text-grey' : '']">吸筹</button>
						<button :class="[item.isMarkingUp ? '!bg-green/30 !text-grey' : '']">拉升中</button>
						<button :class="[item.isDistributing ? '!bg-red/30 !text-grey' : '']">出货</button>
						<button :class="[item.isBullTrap ? '!bg-green/30 !text-grey' : '']">诱多</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
