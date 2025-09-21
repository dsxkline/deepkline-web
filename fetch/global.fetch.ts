import { useFetch, type UseFetchOptions } from '#app'
import { useSyncedCookie } from '~/composable/useSyncedCookie'

/**
 * 检查当前是否在 Nuxt 组件 setup 生命周期内
 */
const inSetup = () => {
	try {
		// 如果当前在 Vue 组件 setup 内，会有 active effectScope
		return !!getCurrentInstance()
	} catch {
		return false
	}
}

/**
 * 通用 API 调用封装
 */
async function useApi<T = any>(method: 'GET' | 'POST', baseUrl: string, path: string, params: Record<string, any> = {}, headers: Record<string, any> = {}) {
	// ======= 公共头部 =======
	let deviceId = useSyncedCookie('uuid').value
	if (process.client && !deviceId) {
		deviceId = localStorage.getItem('AEGIS_ID') || undefined
	}
	if (deviceId) {
		useSyncedCookie('uuid').value = deviceId
		headers['uuid'] = deviceId
	}
	headers['authorization'] = 'Bearer ' + (useSyncedCookie('token').value || '')
	headers['locale'] = useSyncedCookie('locale').value || useSyncedCookie('i18n_redirected').value
	if (process.env.MODE) headers['mode'] = process.env.MODE

	const options: UseFetchOptions<T> = {
		headers: { ...headers },
		method,
		baseURL: baseUrl,
		key: `${method}-request-${Date.now()}-${path}`,
		timeout: 10000
	}

	if (method === 'POST') {
		options.body = params
	} else {
		options.query = params
	}

	const url = baseUrl.startsWith('http') ? baseUrl + path : baseUrl + path

	// ======= 自动选择 useFetch / $fetch =======
	if (inSetup()) {
		// 在 setup 生命周期内 -> 用 useFetch（支持 SSR、响应式）
		const { data, error, status } = await useFetch<T>(url, options as any)
		if (status.value === 'success') return normalizeResponse(data.value)
		return handleError(error.value)
	} else {
		// 已经 mounted 或事件触发 -> 用 $fetch（一次性调用）
		try {
			const data = await $fetch(url, options as any)
			return normalizeResponse(data)
		} catch (err: any) {
			return handleError(err)
		}
	}
}

/**
 * 统一处理返回结构
 */
function normalizeResponse(data: any) {
	if (data && typeof data === 'object' && 'code' in data) {
		data.code = parseInt(data.code) || 0
		if (data.code === 401 && process.client) {
			const channel = new BroadcastChannel('logout')
			channel.postMessage(String(new Date().getTime()))
		}
	}
	return data
}

function handleError(err: any) {
	return {
		code: err?.statusCode || 500,
		msg: err?.data?.msg || err?.message,
		data: null
	}
}

// ======= 封装 usePost / useGet =======
export const usePost = <T = any>(baseUrl: string, path: string, body: any = {}, headers: Record<string, any> = {}) => useApi<T>('POST', baseUrl, path, body, headers)

export const useGet = <T = any>(baseUrl: string, path: string, query: Record<string, any> = {}, headers: Record<string, any> = {}) => useApi<T>('GET', baseUrl, path, query, headers)
