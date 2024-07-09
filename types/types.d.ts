import type OKXWebSocket from "~/fetch/okx/okx.websocket";

export enum ApiSource{
  OKX,
  BINANCE,
  DSX
}

declare module '#app' {
  interface NuxtApp {
    $ws: OKXWebSocket,
    $wsb: OKXWebSocket,
  }
}