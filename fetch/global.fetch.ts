import { useFetch, type UseFetchOptions } from '#app'
import CryptoJS from 'crypto-js'
import { useUserStore } from '~/store/user'

const usePost = async <T = any>(baseUrl: string, path: string, body: any = {}, headers: Record<string, any> = {}) => {
	headers['authorization'] = 'Bearer ' + useCookie('token').value
	headers['locale'] = useCookie('locale').value
	const options: UseFetchOptions<T> = {
		headers: Object.assign(headers),
		body,
		method: 'POST',
		baseURL: baseUrl,
		key: 'okx-request-' + Date.now() + path,
		timeout: 10000
	}
	// sign(options, path);

	// const fetch = $fetch.create(options as FetchOptions)
	let { data, error, pending, status } = await useFetch(baseUrl + path, options)
	if (status.value === 'success') {
		if (data.value && typeof data.value === 'object' && 'code' in data.value) {
			data.value.code = parseInt((data.value as { code: any }).code) || 0
			// console.log('ddddd',data.value)
			if (data.value.code == 401) {
				// 注销登录
				if (process.client) {
					const channel = new BroadcastChannel('logout');
					channel.postMessage(String(new Date().getTime()))
				}
			}
		}

		return data.value
	}
	return {
		code: error.value?.statusCode || 500,
		msg: error.value?.data?.msg || '获取数据失败',
		data: null
	}
}

const useGet = async <T = any>(baseUrl: string, path: string, query: Record<string, any> = {}, headers: any = {}) => {
	headers['authorization'] = 'Bearer ' + useCookie('token').value
	headers['locale'] = useCookie('locale').value
	const options: UseFetchOptions<T> = {
		headers: Object.assign(headers),
		query,
		method: 'GET',
		baseURL: baseUrl,
		key: 'okx-request-' + Date.now() + path,
		timeout: 10000
	}
	// sign(options, path);
	// 如果是本地转发
	const url = baseUrl.startsWith('http') ? baseUrl + path : baseUrl
	// console.log(process.client, url,options)
	// const fetch = $fetch.create(options as FetchOptions)
	// let { data, error, pending, status } = await fetch(baseUrl+path, options as FetchOptions);
	let { data, error, pending, status } = await useFetch(url, options)
	// console.log(process.client, url)
	// console.log("error",error);
	if (status.value === 'success') {
		if (data.value && typeof data.value === 'object' && 'code' in data.value) {
			data.value.code = parseInt((data.value as { code: any }).code) || 0
			// console.log('ddddd',data.value)
			if (data.value.code == 401) {
				if (process.client) {
					const channel = new BroadcastChannel('logout');
					channel.postMessage(String(new Date().getTime()))
				}
			}
		}
		return data.value
	}
	return {
		code: error.value?.statusCode || 500,
		msg: error.value?.data?.msg || '获取数据失败',
		data: null
	}
}
export { usePost, useGet }
