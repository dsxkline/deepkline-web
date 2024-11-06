import { ApiSource } from "~/types/types.d";
import { Okx } from "./okx";
import { useStore } from "~/store";
import { Period } from "./okx/okx.type.d";

export const tradingDataFetch = {
    longShortAccountRatio:(ccy:string,period:Period=Period.M5,begin:string='',end:string='')=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.longShortAccountRatio(ccy,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
}