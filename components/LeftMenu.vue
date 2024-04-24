<script setup lang="ts">
const menuList = [
    {
        name: "home",
        icon: "icon-home",
        text: "首页",
        active: true
    },
    {
        name: "market",
        icon: "icon-market",
        text: "行情",
        active: false
    },
    {
        name: "trade",
        icon: "icon-trade",
        text: "交易",
       active: false
    }]

const changeMenu = (name: string) => {
    menuList.forEach((item) => {
        item.active = item.name === name;
    });
};
</script>
<template>
    <div class="left-menu">
        <ul>
            <li
                v-for="(item, index) in menuList"
                :key="index"
                :class="{ active: item.active }"
                @click="changeMenu(item.name)"
            >
                <i :class="item.icon"></i>
                <span class="left-menu-item-text">{{ item.text }}</span>
            </li>
        </ul>
       
    </div>
</template>