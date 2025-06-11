import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { AccountDto } from './dtos/account'
import type { ExchangeDto } from './dtos/exchange'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/account/list'
const exchangesApi = '/account/exchanges'

export const accountFetch = {
	/**
	 * 账户列表
	 * @returns
	 */
	list: () =>
		usePost<ApiResult<AccountDto[]>>(baseUrl, listApi),

	/**
	 * 交易所列表
	 * @returns
	 */
	exchanges: () =>
		usePost<ApiResult<ExchangeDto[]>>(baseUrl, exchangesApi),

	
}
