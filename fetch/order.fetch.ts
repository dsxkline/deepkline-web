import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { FundDto, AccountDto } from './dtos/account.dto'
import type { ExchangeDto } from './dtos/exchange.dto'
import type { AddOrderDto, AddOrderRespDto, OrderDto, OrderState } from './dtos/order.dto'
import type { PositionDto } from './dtos/position.dto'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/order/list'
const positionsApi = '/order/positions'
const assetsApi = '/order/assets'
const addApi = '/order/add'

export const orderFetch = {
	/**
	 * 挂单列表
	 * @returns
	 */
	list: (accountId?: number, state?: OrderState) => usePost<ApiResult<OrderDto[]>>(baseUrl, listApi, { accountId, state }),

	/**
	 * 合约持仓列表
	 * @returns
	 */
	positions: (accountId?: number) => usePost<ApiResult<PositionDto[]>>(baseUrl, positionsApi, { accountId }),

	/**
	 * 资产列表
	 * @returns
	 */
	crypeAssets: (accountId?: number) => usePost<ApiResult<PositionDto[]>>(baseUrl, assetsApi, { accountId }),

	/**
	 * 下单
	 * @param payload
	 * @returns
	 */
	add: (payload: AddOrderDto) => usePost<ApiResult<AddOrderRespDto>>(baseUrl, addApi, payload)
}
