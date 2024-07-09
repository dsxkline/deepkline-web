import { defineNuxtPlugin } from '#app'
import OKXWebSocket from '~/fetch/okx/okx.websocket';
export default defineNuxtPlugin(({ vueApp }) => {
    const ws = new OKXWebSocket()
	ws.connect();
	const wsb = OKXWebSocket.createBusiness()
	wsb.connect();
	vueApp.provide('ws',ws)
    vueApp.provide('wsb',ws)
});
