<script setup lang="ts">
	const categories = ref([{}, {}, {}, {},{}, {}, {}, {}])
</script>
<template>
	<div class="market-category px-4 py-2">
		<h3 class="pb-3 flex justify-between items-center">
			热门板块 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
        <div class="w-full overflow-x-scroll scrollbar-hide">
		<ul class="flex w-max">
			<template v-for="item in categories">
				<li class="p-2 rounded-md bg-[--transparent02] w-[calc(var(--body-width)/2)] mr-2">
					<h4 class="text-sm">Liquid Staking</h4>
					<div class="text-sm flex flex-col py-3">
						<b class="text-green">+1.70%</b>
						<span class="text-xs text-grey">24小时涨跌</span>
					</div>
					<div class="text-xs flex"><span>RPL</span><span class="text-green">+8.68%</span></div>
				</li>
			</template>
		</ul>
        </div>
	</div>
</template>
