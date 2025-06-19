<template>
    <div class="px-4 my-4 flex flex-col">
        <h3 class="pb-2 border-b border-[--transparent05]">收益曲线</h3>
        <LineChart symbol="BTC-USDT" class="w-full h-full" />
        <div class="py-3 border-t border-[--transparent05]">
            <ul class="flex text-sm justify-between items-center *:px-2 *:py-[2px] *:rounded-full *:text-grey">
                <li>1日</li>
                <li>1周</li>
                <li class="bg-[--transparent10] !text-main">1月</li>
                <li>半年</li>
                <li>1年</li>
                <li>全部</li>
            </ul>
        </div>
    </div>
</template>