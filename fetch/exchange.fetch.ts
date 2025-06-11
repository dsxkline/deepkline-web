import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { ExchangeDto } from './dtos/exchange'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/exchange/list'

export const exchangeFetch = {
	/**
	 * 账户列表
	 * @returns
	 */
	list: () =>
		usePost<ApiResult<ExchangeDto[]>>(baseUrl, listApi),

	
}
