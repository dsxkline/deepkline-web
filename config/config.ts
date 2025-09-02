import {version} from '../package.json'
export default {
	// OKX_SECRET_KEY: process.env.OKX_SECRET_KEY,
	// OKX_API_KEY: process.env.OKX_API_KEY,
	// OKX_PASSPHRASE: process.env.OKX_PASSPHRASE,
	MODE:process.env.MODE,
	BASE_API_URL: process.env.BASE_API_URL,
	VERSION:version,
	CAPTCHA_APP_ID:process.env.CAPTCHA_APP_ID,
	BASE_WS_URL: process.env.BASE_WS_URL || 'http://127.0.0.1:3003'
}
