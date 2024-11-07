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

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const headers = event.node.req.headers;
    const targetUrl = 'https://www.okx.com'; // Define the target URL
    const path = headers.path;
    try {
        const queryString = new URLSearchParams(query as any).toString()
        const url = event.node.req.method == 'GET' ? targetUrl + path + '?' + queryString : targetUrl + path;
        // console.log('server api url', url);
        const newHeaders:any = {
            'user-agent':headers['user-agent'],
            'cookie':headers['cookie'],
            'content-type':headers['content-type'],
            'origin':headers['origin'],
            ...commonHeader("okx")
        }
        const options = {
            method: event.node.req.method as any,
            headers: newHeaders,
            body: event.node.req.method !== 'GET' ? await readBody(event) : undefined,
            timeout: 15000, // 增加超时时间
            retry: 0, // 增加重试次数
        }
        sign(options,path as string);
        // console.log('server api options',url,options);
        // 转发请求到目标 URL
        const response = await $fetch(url,options)

        return response
    } catch (error) {
        console.error('Error forwarding request:', error)
        // data, error, pending, status
        // throw createError({
        //     statusCode: 500,
        //     message: 'Failed to forward request -------'
        // })
        return {
            data: null,
            msg:'Failed to forward request---',
            error: error,
            loading: false,
            status: 500
        }
    }
})
