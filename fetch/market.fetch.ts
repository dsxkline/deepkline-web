import { ApiSource } from "~/types/types.d";
import { Okx } from "./okx";
import { useStore } from "~/store";


export const marketFetch = {
    getKlines:(symbol:string='',cycle:string='',after:string='',before:string='',limit:number=300)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.marketFetch.candles(symbol,cycle,after,before,limit.toString())
        }
        return Promise.reject('api source is not supported')
    },
    booksFull:(symbol:string,sz:number)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.marketFetch.booksFull(symbol,sz)
        }
        return Promise.reject('api source is not supported')
    },
    getTrades:(symbol:string,limit?:number)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.marketFetch.trades(symbol,limit)
        }
        return Promise.reject('api source is not supported')
    }
}