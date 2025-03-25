<script setup lang="ts">

const symbols = ref([

])

</script>
<template>
  <div class="">
    <div class="w-full py-2  px-5">
      <ul class="grid grid-cols-4 *:flex *:items-center text-xs text-grey">
        <li class="col-span-2"><span>名称</span><ArrowDropDownOrUp /></li>
        <li class="justify-end"><span>最新价</span><ArrowDropDownOrUp /></li>
        <li class="justify-end"><span>今日涨跌</span><ArrowDropDownOrUp /></li>
      </ul>
    </div>
    <ul class="w-full">
      <li class="w-full grid grid-cols-4 *:flex *:items-center py-3 hover:bg-[--transparent03] px-5" v-for="item in 20">
        <div class="col-span-2"><SymbolName /></div>
        <div class="justify-end px-1"><SymbolPrice /></div>
        <div class="justify-end px-1"><SymbolChangeButton /></div>
      </li>
    </ul>
  </div>
</template>
