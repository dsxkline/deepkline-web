<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'

	const datas = ref([
		{
			instId: 'BTC-USDT',
			accumulating: 20, // 吸筹期
			markingUp: 0, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'ETH-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 20, // 拉升期
			distributing: 80, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'SOL-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 20, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 20 // 诱多期
		},
		{
			instId: 'TRUMP-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 0, // 拉升期
			distributing: 60, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'TIA-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 20, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'MEME-USDT',
			accumulating: 10, // 吸筹期
			markingUp: 0, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'BTC-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 20, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'BTC-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 0, // 拉升期
			distributing: 10, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'BTC-USDT',
			accumulating: 50, // 吸筹期
			markingUp: 0, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 0 // 诱多期
		},
		{
			instId: 'BTC-USDT',
			accumulating: 0, // 吸筹期
			markingUp: 20, // 拉升期
			distributing: 0, // 出货期
			bullTrap: 100 // 诱多期
		}
	])
</script>
<template>
	<div class="py-2">
		<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between">
			<template v-for="item in datas">
				<li>
					<div class="col-span-2" v-autosize="16">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.instId)" />
					</div>
					<div class="col-span-3 flex-auto grid grid-cols-4 w-full text-[10px] *:py-1 *:rounded-sm *:bg-[--transparent02] *:text-[--transparent10] gap-2">
						<button :style="[item.accumulating ? 'background:rgb(var(--color-brand) / ' + item.accumulating / 100 + ');color:rgb(var(--color-text-main)/' + item.accumulating / 100 + ')' : '']">
							吸筹
						</button>
						<button :style="[item.markingUp ? 'background:rgb(var(--color-green) / ' + item.markingUp / 100 + ');color:rgb(var(--color-text-main)/' + item.markingUp / 100 + ')' : '']">拉升中</button>
						<button :style="[item.distributing ? 'background:rgb(var(--color-red) / ' + item.distributing / 100 + ');color:rgb(var(--color-text-main)/' + item.distributing / 100 + ')' : '']">
							出货
						</button>
						<button :style="[item.bullTrap ? 'background:rgb(var(--color-brand) / ' + item.bullTrap / 100 + ');color:rgb(var(--color-text-main)/' + item.bullTrap / 100 + ')' : '']">诱多</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
<style lang="less" scoped>
	.accumulating {
	}
</style>
