import { useFetch, type UseFetchOptions } from "#app";
import CryptoJS from 'crypto-js'

const sign = <T>(options: UseFetchOptions<T>, path: string) => {
    const config = {
        secretKey: useRuntimeConfig().public.OKX_SECRET_KEY,
        apikey: useRuntimeConfig().public.OKX_API_KEY,
        passPhrase: useRuntimeConfig().public.OKX_PASSPHRASE,
    }
    const timestamp = new Date().toISOString();
    const method = options.method;
    const body = options.body ? JSON.stringify(options.body) : '';
    const s = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + method + path + body, config.secretKey as string));
    Object.assign(options.headers || {}, {
        "OK-ACCESS-SIGN": s,
        "OK-ACCESS-TIMESTAMP": timestamp,
    })
}

const commonHeader = (source: string): any => {
    if (process.client) return {};
    const config = {
        secretKey: useRuntimeConfig().public.OKX_SECRET_KEY,
        apikey: useRuntimeConfig().public.OKX_API_KEY,
        passPhrase: useRuntimeConfig().public.OKX_PASSPHRASE,
    }
    return {
        okx: {
            "Content-Type": "application/json",
            "OK-ACCESS-KEY": config.apikey,
            "OK-ACCESS-SIGN": "",
            "OK-ACCESS-PASSPHRASE": config.passPhrase,
            "OK-ACCESS-TIMESTAMP": new Date().toISOString(),
        }
    }[source]
}
const usePost = async <T = any>(baseUrl: string, path: string, body: any = {}, headers: Record<string, any> = {}) => {
    const options: UseFetchOptions<T> = {
        headers: Object.assign(
            commonHeader("okx"),
            headers
        ),
        body,
        method: "POST",
        baseURL: baseUrl,
        key: 'okx-request-' + Date.now()+path,
        timeout:10000
    };
    // sign(options, path);

    // const fetch = $fetch.create(options as FetchOptions)
    let { data, error, pending, status } = await useFetch(baseUrl + path, options);
    if (status.value === "success") {
        if (data.value && typeof data.value === 'object' && 'code' in data.value) {
            data.value.code = parseInt((data.value as { code: any }).code) || 0;
        }
        return data.value;
    }
    return {

        code: error.value?.statusCode || 500,
        msg: error.value?.data?.msg || '获取数据失败',
        data: null

    };
}

const useGet = async <T = any>(baseUrl: string, path: string, query: Record<string, any> = {}, headers: any = {}) => {
    const options: UseFetchOptions<T> = {
        headers: Object.assign(
            commonHeader("okx"),
            // Object.assign(headers, {
            //     path: path,
            // }),
        ),
        query,
        method: "GET",
        baseURL: baseUrl,
        key: 'okx-request-' + Date.now()+path,
        timeout:10000,
    };
    // sign(options, path);
    // 如果是本地转发
    const url = baseUrl.startsWith('http') ? baseUrl + path : baseUrl;
    // console.log(process.client, url,options)
    // const fetch = $fetch.create(options as FetchOptions)
    // let { data, error, pending, status } = await fetch(baseUrl+path, options as FetchOptions);
    let { data, error, pending, status } = await useFetch(url, options);
    // console.log(process.client, url)
    // console.log("error",error);
    if (status.value === "success") {
        if (data.value && typeof data.value === 'object' && 'code' in data.value) {
            data.value.code = parseInt((data.value as { code: any }).code) || 0;
        }
        return data.value ;
    }
    return {
        code: error.value?.statusCode || 500,
        msg: error.value?.data?.msg || '获取数据失败',
        data: null

    };
};
export { usePost, useGet };
