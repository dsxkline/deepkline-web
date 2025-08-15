import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { MainForceDto, MarketType, MoneyFlowDto, PriceSupportDto, SymbolDto } from './dtos/symbol.dto'
import { useStore } from '~/store'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/symbols/list'
const moneyFlowApi = '/symbols/moneyflow'
const mainforceApi = '/symbols/mainforce'
const supportApi = '/symbols/support'

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
	// 资金流向
	moneyFlow: (symbol: string) =>
		usePost<ApiResult<MoneyFlowDto>>(baseUrl, moneyFlowApi, {
			symbol
		}),
	// 主力异动
	mainforce: (page: number = 1, pageSize: number = 10, symbol?: string) =>
		usePost<ApiResult<MainForceDto[]>>(baseUrl, mainforceApi, {
			page,
			pageSize,
			symbol
		}),
	// 价格突破
	support: (page: number = 1, pageSize: number = 10, symbol?: string) =>
		usePost<ApiResult<PriceSupportDto[]>>(baseUrl, supportApi, {
			page,
			pageSize,
			symbol
		})
}
