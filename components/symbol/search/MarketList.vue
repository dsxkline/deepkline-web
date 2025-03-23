<script setup lang="ts">
import { type MenuModel } from "../../common/TabBar.vue";
import TabBar from "../../common/TabBar.vue";
import SymbolList from "./SymbolList.vue";
const menus = ref<MenuModel[]>([
  {
    name: "币种",
    contentComp: markRaw(SymbolList),
  },
  {
    name: "现货",
    contentComp: markRaw(SymbolList),
  },
  {
    name: "合约",
    contentComp: markRaw(SymbolList),
  }
]);
</script>
<template>
    <div>
        <div class="">
            <TabBar :menus="menus" />
        </div>

    </div>
</template>

<style lang="less" scoped>
:deep(.tabbar-container){
    .tabbar-header{
        ul{
            li{
                font-size: 12px;
            }
        }
    }
}
</style>