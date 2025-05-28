import { defineStore } from 'pinia'
export const useKlineStore = defineStore({
  id: 'kline',
  state: () => ({
    cycle:{} as Record<string,string>,
    main:{} as Record<string,string[]>,
    sides:{} as Record<string,string[]>,
    loading:{} as Record<string,boolean>,
    klineColorModel:'green-red' as ('green-red'|'red-green'), // k线颜色模型，green-red:绿色上涨红色下跌，red-green:红色上涨绿色下跌
    timezone: 'UTC+8' as ('UTC+8'|"UTC"|"24"), // 时区，默认UTC
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
    },
    setKlineColorModel(model:'green-red'|'red-green') {
      this.klineColorModel = model
    },
    setTimezone(timezone:'UTC+8'|"UTC"|"24") {
      this.timezone = timezone
    },
  }
})