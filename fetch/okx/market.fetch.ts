import type { ApiResult } from "~/types/types";
import { useGet, usePost } from "../global.fetch";
import type { BookResponse, TradesResponse } from "./okx.type.d";
const baseUrl = "https://www.okx.com"
const marketCandles = '/api/v5/market/candles';
// 深度
const booksFull = '/api/v5/market/books-full';
// 获取交易产品公共成交数据 成交明细
const trades = '/api/v5/market/trades';

export const marketFetch = {
    candles:<T = any>(instId:string,bar:string,after:string,before:string,limit:string="300")=>useGet<ApiResult<T>>(baseUrl,marketCandles,{
        instId,bar,after,before,limit
    }),
    booksFull:(instId:string,sz:number=20)=>useGet<ApiResult<BookResponse[]>>(baseUrl,booksFull,{
        instId,sz
    }),
    /**
     * 
     * @param instId 产品ID，如 BTC-USDT
     * @param limit 分页返回的结果集数量，最大为500，不填默认返回100条
     * @returns 
     */
    trades:(instId:string,limit:number=500)=>useGet<ApiResult<TradesResponse[]>>(baseUrl,trades,{
        instId,limit:limit+''
    })
}