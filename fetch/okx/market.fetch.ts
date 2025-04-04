import type { ApiResult } from "~/types/types";
import { useGet, usePost } from "../global.fetch";
const baseUrl = "https://www.okx.com"
const marketCandles = '/api/v5/market/candles';
// 深度
const booksFull = '/api/v5/market/books-full';


export const marketFetch = {
    candles:(instId:string,bar:string,after:string,before:string,limit:string="300")=>useGet<ApiResult>(baseUrl,marketCandles,{
        instId,bar,after,before,limit
    }),
    booksFull:(instId:string,sz:number=20)=>useGet<ApiResult>(baseUrl,booksFull,{
        instId,sz
    })
}