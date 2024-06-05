import { defineStore } from 'pinia'
import { ApiSource } from '~/types/types.d'

export const useStore = defineStore({
  id: 'main',
  state: () => ({
    apiSource:ApiSource.OKX
  }),
  actions: {
    setApiSource(source:ApiSource) {
      this.apiSource = source
    }
  }
})