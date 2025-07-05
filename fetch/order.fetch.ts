import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { FundDto, AccountDto } from './dtos/account'
import type { ExchangeDto } from './dtos/exchange'
import type { AddOrderDto, AddOrderRespDto } from './dtos/order'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/order/list'
const addApi = '/order/add'

export const orderFetch = {
	/**
	 * 订单列表
	 * @returns
	 */
	list: () => usePost<ApiResult<AccountDto[]>>(baseUrl, listApi),

	/**
	 * 下单
	 * @param payload
	 * @returns
	 */
	add: (payload: AddOrderDto) => usePost<ApiResult<AddOrderRespDto>>(baseUrl, addApi, payload)
}
