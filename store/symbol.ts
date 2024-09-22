import type { Ticket } from '@element-plus/icons-vue'
import { defineStore } from 'pinia'
import type { Ticker } from '~/fetch/okx/okx.type'

export const useSymbolStore = defineStore({
  id: 'symbol',
  state: () => ({
    // 保存所有的symbols
    symbols:{},
    // 正在订阅的symbols
    subSymbols:{} as Record<string, any>,
    // symbol的tick行情
    tickets:{} as Record<string, Ticker>,
  }),
  actions: {
    setSubSymbols(symbol:string) {
      this.subSymbols[symbol] = symbol
    },
    setTickets(symbol:string,ticket:Ticker) {
      this.tickets[symbol] = ticket
      console.log(this.tickets)
    }
  }
})