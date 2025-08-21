import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { ExchangeDto, FearDto, MarketSectorChartDto, MarketSectorDto, UpDownsDto } from './dtos/exchange.dto'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/exchange/list'
const fearApi = '/exchange/fear'
const updownsApi = '/exchange/updowns'
const marketSectorApi = '/exchange/sectors'
const marketSectorChartApi = '/exchange/sector/chart'

export const exchangeFetch = {
	/**
	 * 账户列表
	 * @returns
	 */
	list: () => usePost<ApiResult<ExchangeDto[]>>(baseUrl, listApi),

	fear: () => usePost<ApiResult<FearDto>>(baseUrl, fearApi),
	/**
	 * 获取交易所涨跌幅
	 * @returns
	 */
	updowns: () => usePost<ApiResult<UpDownsDto>>(baseUrl, updownsApi),

	marketSectors: () => usePost<ApiResult<MarketSectorDto[]>>(baseUrl, marketSectorApi),

	marketSectorChart: (sectorId:number) => usePost<ApiResult<MarketSectorChartDto[]>>(baseUrl, marketSectorChartApi,{
		sectorId
	}),
}
