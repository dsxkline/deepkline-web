import { defineStore } from 'pinia'
import { ApiSource } from '~/types/types.d'

export const useStore = defineStore({
  id: 'main',
  state: () => ({
    apiSource:ApiSource.OKX,
    hideSplitLeft:false,
    hideSplitRight:false
  }),
  actions: {
    setApiSource(source:ApiSource) {
      this.apiSource = source
    },
    setSplitLeft(hide:boolean) {
      this.hideSplitLeft = hide
    },
    setSplitRight(hide:boolean) {
      this.hideSplitRight = hide
    }
  }
})