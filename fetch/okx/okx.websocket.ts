import BaseWebSocket from "~/utils/base.websocket";

// WebSocket公共频道：wss://ws.okx.com:8443/ws/v5/public
// WebSocket私有频道：wss://ws.okx.com:8443/ws/v5/private
// WebSocket业务频道：wss://ws.okx.com:8443/ws/v5/business

export default class OKXWebSocket extends BaseWebSocket {
    constructor() {
        const url = "wss://ws.okx.com:8443/ws/v5/public";
        super(url);
        
    }

}
