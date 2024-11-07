import { useFetch, type UseFetchOptions } from "#app";
import CryptoJS from 'crypto-js'

const sign = <T>(options:UseFetchOptions<T>,path:string)=>{
    const config = {
        secretKey: useRuntimeConfig().public.OKX_SECRET_KEY,
        apikey: useRuntimeConfig().public.OKX_API_KEY,
        passPhrase: useRuntimeConfig().public.OKX_PASSPHRASE,
    }
    const timestamp = new Date().toISOString();
    const method = options.method;
    const body = options.body?JSON.stringify(options.body):'';
    const s = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + method + path + body, config.secretKey as string));
    Object.assign(options.headers||{},{
        "OK-ACCESS-SIGN": s,
        "OK-ACCESS-TIMESTAMP": timestamp,
    })
}

const commonHeader = (source:string):any=>{
    if(process.client) return {};
    const config = {
        secretKey: useRuntimeConfig().public.OKX_SECRET_KEY,
        apikey: useRuntimeConfig().public.OKX_API_KEY,
        passPhrase: useRuntimeConfig().public.OKX_PASSPHRASE,
    }
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

    // const fetch = $fetch.create(options as FetchOptions)
    // let { data, error, pending, status } = await fetch(baseUrl+path, options as FetchOptions);
	let { data, error, pending, status } = await useFetch(baseUrl+path, options);

	return { data, error, loading: pending, status };
};

const useGet = async <T = any>(baseUrl:string,path: string, query: Record<string, string> = {}, headers: any = {}) => {
	const options: UseFetchOptions<T> = {
		headers: Object.assign(
			commonHeader("okx"),
			Object.assign(headers,{
                path:path
            }),
		),
		query,
		method: "GET",
        baseURL: baseUrl,
        
	};
    sign(options,path);
    // 如果是本地转发
    const url = baseUrl.startsWith('http')?baseUrl+path:baseUrl;
    console.log(options,baseUrl+path)
    // const fetch = $fetch.create(options as FetchOptions)
    // let { data, error, pending, status } = await fetch(baseUrl+path, options as FetchOptions);
	let { data, error, pending, status } = await useFetch(url, options);
	return { data, error, loading: pending, status };
};
export { usePost, useGet };
