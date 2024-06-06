import { defineStore } from 'pinia'
export const useKlineStore = defineStore({
  id: 'kline',
  state: () => ({
    cycle:'1m'
  }),
  actions: {
    setCycle(cycle:string) {
      this.cycle = cycle
    }
  }
})