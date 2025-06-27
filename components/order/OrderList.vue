<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
</script>

<template>
	<div class="px-4 min-h-80">
		<ul>
			<template v-for="item in 3">
				<li class="border-b border-[--transparent05] py-3">
					<div class="flex justify-between">
						<SymbolName :symbol="useSymbolStore().getSymbol('BTC-USDT')" class="text-base roboto-bold" />
						<div class="flex justify-between items-center gap-4">
							<button class="flex items-center">
								<el-icon><Edit /></el-icon>
							</button>
						</div>
					</div>
					<div class="py-1 flex items-center *:mr-1">
						<button class="tag-green">限价</button>
						<button class="tag-red">开多</button>
						<button class="tag-default">逐仓</button>
						<span class="text-xs text-grey">03/11 08:48:21</span>
					</div>
					<div class="flex justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey">
						<div class="flex flex-col">
							<span>委托/已成(USDT)</span>
							<b>196</b>
						</div>
						<div class="flex flex-col">
							<span>已成数量(USDT)</span>
							<b>196</b>
						</div>
						<div class="flex flex-col justify-center items-end">
							<span>委托价格</span>
							<b>196</b>
						</div>
					</div>
					<div class="flex items-center gap-2 justify-between">
						<div class="flex items-center gap-2 justify-between">
							<button class="bt-default">止盈 12455.9</button>
							<button class="bt-default">止损 12000.3</button>
						</div>
						<button class="bt-default">撤单</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
