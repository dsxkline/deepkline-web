import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { MarketType, MoneyFlowDto, SymbolDto } from './dtos/symbol.dto'
import { useStore } from '~/store'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/symbols/list'
const moneyFlowApi = '/symbols/moneyflow'

export const symbolsFetch = {
	/**
	 * 品种列表
	 * @returns
	 */
	list: (marketType: MarketType, exchange: string = useStore().exchange) =>
		usePost<ApiResult<SymbolDto[]>>(baseUrl, listApi, {
			exchange,
			marketType
		}),

	moneyFlow: (symbol: string) =>
		usePost<ApiResult<MoneyFlowDto>>(baseUrl, moneyFlowApi, {
			symbol
		})
}
