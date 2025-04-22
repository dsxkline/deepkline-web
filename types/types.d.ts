import type OKXWebSocket from "~/fetch/okx/okx.websocket";
export enum ApiSource{
  OKX,
  BINANCE,
  DSX
}

interface ApiResult<T = any> {
  data:T,
  code:number,
  msg:string
}

declare module '#app' {
  interface NuxtApp {
    $ws: OKXWebSocket,
    $wsb: OKXWebSocket,
    $push:(comp: any, params: {}, size: string)=>void,
    $pushLeft:(comp: any, params: {}, size: string)=>void,
    $pushUp:(comp: any, params: {}, size: string)=>void,
    $pushDown:(comp: any, params: {}, size: string)=>void
    $clickSound:()=>void
  }
}