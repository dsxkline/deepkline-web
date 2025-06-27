<script setup lang="ts">
import { useSymbolStore } from '~/store/symbol';

</script>

<template>
    <div class="p-4 min-h-80">
        <ul>
            <li>
                <div>
                    <SymbolName :symbol="useSymbolStore().getSymbol('BTC-USDT')" class="text-xl"/>
                </div>
                <div class="flex items-center *:mr-1">
                    <button class="tag-green">限价</button>
                    <button class="tag-red">开多</button>
                    <button class="tag-default">逐仓</button>
                </div>
            </li>
        </ul>
    </div>
</template>