import { defineStore } from 'pinia'

export const useSymbolStore = defineStore({
  id: 'symbol',
  state: () => ({
    symbols:{}
  }),
  actions: {
    setSymbols() {

    }
  }
})