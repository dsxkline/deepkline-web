import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { FundDto, AccountDto } from './dtos/account.dto'
import type { ExchangeDto } from './dtos/exchange.dto'
import type { AddOrderDto, AddOrderRespDto, HistoryOrderListDto, OrderDto, OrderState } from './dtos/order.dto'
import type { HistoryPositionDto, PositionDto } from './dtos/position.dto'
import type { HistoryTradeListDto } from './dtos/trade.dto'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const listApi = '/order/list'
const positionsApi = '/order/position'
const assetsApi = '/order/assets'
const historyListApi = '/order/list/history'
const historyPositionsApi = '/order/position/history'
const historyAssetsApi = '/order/assets/history'
const addApi = '/order/add'
const cancelApi = '/order/cancel'
const tradeListApi = '/trade/history'

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
	 * 历史挂单列表
	 * @returns
	 */
	historyList: (accountId?: number, state?: OrderState, page: number = 1, pageSize: number = 30) => usePost<ApiResult<HistoryOrderListDto>>(baseUrl, historyListApi, { accountId, state, page, pageSize }),

	/**
	 * 历史合约持仓列表
	 * @returns
	 */
	historyPositions: (accountId?: number, page: number = 1, pageSize: number = 30) => usePost<ApiResult<HistoryPositionDto>>(baseUrl, historyPositionsApi, { accountId, page, pageSize }),

	/**
	 * 历史资产列表
	 * @returns
	 */
	historyCrypeAssets: (accountId?: number, page: number = 1, pageSize: number = 30) => usePost<ApiResult<HistoryPositionDto>>(baseUrl, historyAssetsApi, { accountId, page, pageSize }),

	/**
	 * 交易账单列表
	 * @returns
	 */
	historyTradeList: (accountId?: number, page: number = 1, pageSize: number = 30) => usePost<ApiResult<HistoryTradeListDto>>(baseUrl, tradeListApi, { accountId, page, pageSize }),

	/**
	 * 下单
	 * @param payload
	 * @returns
	 */
	add: (payload: AddOrderDto) => usePost<ApiResult<AddOrderRespDto>>(baseUrl, addApi, payload),

	/**
	 * 撤单
	 * @param orderId 订单ID
	 * @returns
	 */
	cancel: (orderId: string, accountId?: number) => usePost<ApiResult<boolean>>(baseUrl, cancelApi, { accountId, orderId })
}
