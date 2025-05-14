import { ApiSource } from "~/types/types.d";
import { Okx } from "./okx";
import { useStore } from "~/store";
import { Period,InstanceType} from "./okx/okx.type.d";

export const tradingDataFetch = {
    longShortAccountRatio:(ccy:string,period:Period=Period.M5,begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.longShortAccountRatio(ccy,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
    longShortAccountRatioContract:(instId:string,period:Period=Period.M5,begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.longShortAccountRatioContract(instId,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
    loanRatio:(ccy:string,period:Period=Period.M5,begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.loanRatio(ccy,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
    openInterestVolume:(ccy:string,period:Period=Period.M5,begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.openInterestVolume(ccy,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
    takerVolumne:(ccy:string,instType:InstanceType,period:Period=Period.M5,begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.takerVolume(ccy,instType,period,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    },
    takerVolumeContract:(instId:string,instType:InstanceType,period:Period=Period.M5,unit:"0"|"1"|"2"="1",begin?:string,end?:string)=>{
        const state = useStore();
        const apiSource = state.apiSource;
        if(apiSource==ApiSource.OKX){
            return Okx.tradingDataFetch.takerVolumeContract(instId,instType,period,unit,begin,end)
        }
        return Promise.reject('apiSource is not supported')
    }
}
