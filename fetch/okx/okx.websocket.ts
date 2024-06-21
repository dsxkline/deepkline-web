import BaseWebSocket from "~/utils/base.websocket";
import type { SubArgs } from "./okx.type";

// WebSocket公共频道：wss://ws.okx.com:8443/ws/v5/public
// WebSocket私有频道：wss://ws.okx.com:8443/ws/v5/private
// WebSocket业务频道：wss://ws.okx.com:8443/ws/v5/business

export default class OKXWebSocket extends BaseWebSocket {
    constructor() {
        const url = "wss://ws.okx.com:8443/ws/v5/public";
        super(url);
    }

    subTickers(instId:string[],callback: (data: any, error: Event | null) => void): void {
        const sendDatas = {
            "op":"subscribe",
            "args":instId.map((item)=>{
                return {
                    "channel":"tickers",
                    "instId":item
                }
            })
        }
        this.subscribe(sendDatas,callback);
    }

}
