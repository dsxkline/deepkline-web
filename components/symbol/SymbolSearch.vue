<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { type MenuModel } from "../common/TabBar.vue";
import TabBar from "../common/TabBar.vue";
import Options from "./search/Options.vue";
import SymbolList from "./search/SymbolList.vue";
import MarketList from "./search/MarketList.vue";
const keyword = ref("");
const menus = ref<MenuModel[]>([
  {
    name: "自选",
    contentComp: markRaw(Options),
    contentParams: {
      title: "测试",
    },
  },
  {
    name: "市场",
    contentComp: markRaw(MarketList),
  },
  {
    name: "主流币",
  },
  {
    name: "热门币",
  },
  {
    name: "涨幅榜",
  },
  {
    name: "新币榜",
  },
]);
const search = () => {};

onMounted(() => {
  setInterval(() => {
    if (menus.value[0].contentParams)
      menus.value[0].contentParams = {
        title: new Date().getTime().toFixed(0),
      };
  }, 1000);
});
</script>
<template>
  <div>
    <el-input
      v-model="keyword"
      placeholder="Please Input"
      :prefix-icon="Search"
      style="width: 300px"
      @keyup.enter="search"
    />
    <TabBar :menus="menus" :hideLine="true"/>
  </div>
</template>
