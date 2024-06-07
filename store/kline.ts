import { defineStore } from 'pinia'
export const useKlineStore = defineStore({
  id: 'kline',
  state: () => ({
    cycle:'1m',
    main:['MA'],
    sides:['MACD']
  }),
  actions: {
    setCycle(cycle:string) {
      this.cycle = cycle
    },
    setMain(index:string) {
        if(this.main.includes(index)) {
            this.main = this.main.filter(item => item !== index)
        } else {
            this.main.push(index)
        }
        this.main = JSON.parse(JSON.stringify(this.main));
    },
    setSides(index:string) {
        if(this.sides.includes(index)) {
            this.sides = this.sides.filter(item => item !== index)
        } else {
            this.sides.push(index)
        }
        this.sides = JSON.parse(JSON.stringify(this.sides));
    }
  }
})