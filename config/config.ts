import {version} from '../package.json'
export default {
	AUTH_GOOGLE_APPID: process.env.AUTH_GOOGLE_APPID,
	MODE:process.env.MODE,
	BASE_API_URL: process.env.BASE_API_URL,
	VERSION:version,
	CAPTCHA_APP_ID:process.env.CAPTCHA_APP_ID,
	BASE_WS_URL: process.env.BASE_WS_URL || 'http://127.0.0.1:3003'
}
