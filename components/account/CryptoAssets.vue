<script setup lang="ts">
	import { useAccountStore } from '~/store/account'
	const point = 8
</script>

<template>
	<div class="px-4">
		<h3 class="pb-3">资产</h3>
		<ul  class="*:grid *:grid-cols-3 *:w-full *:py-2 *:items-center *:my-1 *:border-b *:border-[--transparent05]">
            <li>
                <div class="text-xs text-grey">名称</div>
                <div class="text-xs text-right text-grey">数量</div>
                <div class="text-xs text-right text-grey">收益</div>
            </li>
			<template v-for="item in useAccountStore().balance?.details">
				<li>
					<b class="col-span-1 text-base">{{ item.ccy }}</b>
					<div class="flex flex-col col-span-1 text-xs items-end">
						<span class="text-sm">{{ parseFloat(formatPrice(item.eq, point)) }}</span>
						<span class="text-grey">{{ parseFloat(formatPrice(item.eqUsd, point)) }}</span>
					</div>
					<div class="flex flex-col col-span-1 text-xs items-end" v-if="item.totalPnl">
						<span :class="['text-sm',(item.spotUpl || item.totalPnl)>0?'text-green':'text-red']">{{ parseFloat(formatPrice((item.spotUpl || item.totalPnl), 2)) }}</span>
						<span :class="(item.spotUpl || item.totalPnl)>0?'text-green':'text-red'">{{ parseFloat(formatPrice((item.spotUplRatio || item.totalPnlRatio)*100, 2)) }}%</span>
					</div>
                    <div class="flex flex-col col-span-1 text-xs items-end" v-else>
						<span :class="['text-sm']">--</span>
						<span>--</span>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
