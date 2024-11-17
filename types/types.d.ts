import type OKXWebSocket from "~/fetch/okx/okx.websocket";

export enum ApiSource{
  OKX,
  BINANCE,
  DSX
}

interface ApiResult{
  data:any,
  code:number,
  msg:string
}

declare module '#app' {
  interface NuxtApp {
    $ws: OKXWebSocket,
    $wsb: OKXWebSocket,
  }
}