import { useFetch, type UseFetchOptions } from "#app";
import CryptoJS from 'crypto-js'
const config = {
    secretKey: process.env.OKX_SECRET_KEY||'',
    apikey: process.env.OKX_API_KEY,
    passPhrase: process.env.OKX_PASSPHRASE,
}

const sign = <T>(options:UseFetchOptions<T>,path:string)=>{
    const timestamp = new Date().toISOString();
    const method = options.method;
    const body = options.body?JSON.stringify(options.body):'';
    const s = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + method + path + body, config.secretKey));
    Object.assign(options.headers||{},{
        "OK-ACCESS-SIGN": s,
        "OK-ACCESS-TIMESTAMP": timestamp,
    })
}

const commonHeader = (source:string):any=>{
    return {
        okx:{
            "Content-Type": "application/json",
            "OK-ACCESS-KEY": config.apikey,
            "OK-ACCESS-SIGN": "",
            "OK-ACCESS-PASSPHRASE": config.passPhrase,
            "OK-ACCESS-TIMESTAMP": new Date().toISOString(),
        }
    }[source]
}
const usePost = async <T = any>(baseUrl:string,path: string, body: any = {}, headers: Record<string, string> = {}) => {
	const options: UseFetchOptions<T> = {
		headers: Object.assign(
			commonHeader("okx"),
			headers
		),
		body,
		method: "POST",
        baseURL: baseUrl,
	};
    sign(options,path);
	let { data, error, pending, status } = await useFetch(baseUrl+path, options);
	return { data, error, loading: pending };
};

const useGet = async <T = any>(baseUrl:string,path: string, query: Record<string, string> = {}, headers: any = {}) => {
	const options: UseFetchOptions<T> = {
		headers: Object.assign(
			commonHeader("okx"),
			headers
		),
		query,
		method: "GET",
        baseURL: baseUrl,
	};
    sign(options,path);
    console.log(options,baseUrl+path)
	let { data, error, pending, status } = await useFetch(baseUrl+path, options);
	return { data, error, loading: pending };
};
export { usePost, useGet };
