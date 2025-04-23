import { defineStore } from 'pinia'
export const useKlineStore = defineStore({
  id: 'kline',
  state: () => ({
    cycle:{} as Record<string,string>,
    main:{} as Record<string,string[]>,
    sides:{} as Record<string,string[]>,
    loading:{} as Record<string,boolean>
  }),
  actions: {
    setLoading(symbol:string,loading:boolean){
      this.loading[symbol] = loading
    },
    setCycle(symbol:string,cycle:string) {
      this.cycle[symbol] = cycle
    },
    setMain(symbol:string,index:string) {
      let main = this.main[symbol]
        if(main.includes(index)) {
            main = main.filter(item => item !== index)
        } else {
            main.push(index)
        }
        this.main[symbol] = main
    },
    setSides(symbol:string,index:string) {
      let sides = this.sides[symbol]
        if(sides.includes(index)) {
            sides = sides.filter(item => item !== index)
        } else {
            sides.push(index)
        }
        this.sides[symbol] = sides;
    }
  }
})