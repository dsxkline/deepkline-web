import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { FundDto, AccountDto } from './dtos/account.dto'
import type { ExchangeDto } from './dtos/exchange.dto'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/account/list'
const connectApi = '/account/connect'
const fundApi = '/account/fund'
const openApi = '/account/open'
const resetApi = '/account/reset'
export const accountFetch = {
	/**
	 * 账户列表
	 * @returns
	 */
	list: () => usePost<ApiResult<AccountDto[]>>(baseUrl, listApi),

	/**
	 * 连接账户
	 * @param exchange 交易所slug
	 * @param apiKey
	 * @param secretKey
	 * @param passphrase
	 * @returns
	 */
	connect: (exchange: string, apiKey: string, secretKey: string, passphrase?: string) =>
		usePost<ApiResult<AccountDto[]>>(baseUrl, connectApi, {
			exchange,
			apiKey,
			secretKey,
			passphrase
		}),

	/**
	 * 账户资产
	 * @returns
	 */
	fund: (accountId?: number) => usePost<ApiResult<FundDto>>(baseUrl, fundApi, { accountId }),

	/**
	 * 开户
	 * @param exchange 交易所编码
	 * @returns
	 */
	open: (exchange: string) =>
		usePost<ApiResult<AccountDto>>(baseUrl, openApi, {
			exchange: exchange
		}),

	reset: (exchange: string, accountId: number) =>
		usePost<ApiResult<boolean>>(baseUrl, resetApi, {
			exchange,
			accountId
		})
}
