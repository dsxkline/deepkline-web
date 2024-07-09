import BaseWebSocket from "~/utils/base.websocket";
import { WsChannel, type CandleCannel, type CandleMessage, type TickersMessage } from "./okx.type.d";

// WebSocket公共频道：wss://ws.okx.com:8443/ws/v5/public
// WebSocket私有频道：wss://ws.okx.com:8443/ws/v5/private
// WebSocket业务频道：wss://ws.okx.com:8443/ws/v5/business

export default class OKXWebSocket extends BaseWebSocket {
    constructor(channel:WsChannel=WsChannel.public) {
        const url = "wss://ws.okx.com:8443/ws/v5/"+channel;
        super(url);
    }

    static createPublic(){
        return new OKXWebSocket(WsChannel.public);
    }

    static createPrivate(){
        return new OKXWebSocket(WsChannel.private);
    }

    static createBusiness(){
        return new OKXWebSocket(WsChannel.business);
    }

    getSendData(channel:string,instId:string[]){
        return {
            "op":"subscribe",
            "args":instId.map((item)=>{
                return {
                    "channel":channel,
                    "instId":item
                }
            })
        }
    }
    subTickers(instIds:string[],callback: (message: TickersMessage, error: Event | null) => void): string {
        const channel = "tickers";
        const sendDatas = this.getSendData(channel,instIds)
        // 订阅成功推送的数据格式，符合这个格式才会触发回调
        const tag:any = {
            "arg":{"channel":channel}
        };
        // 订阅单个instId，严格匹配instId
        if(instIds.length === 1){
            tag.arg.instId = instIds[0];
        }
        return this.subscribe(sendDatas,tag,callback);
    }
    subCandle(channel:CandleCannel,instIds:string[],callback: (message: CandleMessage, error: Event | null) => void): string {
        const sendDatas = this.getSendData(channel,instIds)
        // 订阅成功推送的数据格式，符合这个格式才会触发回调
        const tag:any = {
            "arg":{"channel":channel}
        };
        // 订阅单个instId，严格匹配instId
        if(instIds.length === 1){
            tag.arg.instId = instIds[0];
        }
        return this.subscribe(sendDatas,tag,callback);
    }
    unsubscribe(subId: string): void {
        const {tag,sendDatas,callback} = this.subscribers[subId]||{};
        if(!sendDatas) return;
        sendDatas.op = "unsubscribe";
        super.unsubscribe(subId,sendDatas);
    }

}
