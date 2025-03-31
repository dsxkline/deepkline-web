import type { Ticket } from '@element-plus/icons-vue'
import { defineStore } from 'pinia'
import type { Instruments, Ticker,InstanceType } from '~/fetch/okx/okx.type.d'

export const useSymbolStore = defineStore({
  id: 'symbol',
  state: () => ({
    currency: 'USDT',
    // 保存所有的symbols
    symbols:{} as Record<string,Instruments>,
    // symbols 分组
    symbolGroup:{} as Record<InstanceType,Instruments[]>, 
    // 正在订阅的symbols
    subSymbols:{} as Record<string, any>,
    // symbol的tick行情
    tickets:shallowReactive({} as Record<string, Ticker>),
  }),
  actions: {
    setSubSymbols(symbol:any) {
      if(typeof symbol=='string'){
        this.subSymbols[symbol] = symbol
      }else{
        (symbol as Array<string>).forEach((item, index) => {
          this.subSymbols[item] = item
        })
      }
      
    },
    setTickets(symbol:string,ticket:Ticker) {
      this.tickets[symbol] = ticket
      // console.log(this.tickets)
    },
    setSymbols(symbols:Instruments[]){
      symbols.forEach((symbol)=>{
        this.symbols[symbol.instId] = symbol;
        if(!this.symbolGroup[symbol.instType]){
          this.symbolGroup[symbol.instType] = []
        }
        this.symbolGroup[symbol.instType].push(symbol)
      })
    },
    getSymbolsByCategory(category:InstanceType,currency:string="USDT"){
      const symbols = this.symbolGroup[category]
      if(!symbols) return
      return symbols.filter(item=>item.quoteCcy==currency || item.settleCcy==currency)
    }
  }
})