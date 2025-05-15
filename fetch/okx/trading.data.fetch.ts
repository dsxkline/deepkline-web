import type { ApiResult } from '~/types/types'
import { useGet, usePost } from '../global.fetch'
import { Period, InstanceType } from './okx.type.d'
import config from '../../config/config'

let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const baseUrlOkx = 'https://www.okx.com'
// 获取支持的币种
const apiSupportCoin = '/api/v5/rubik/stat/contracts/support-coin'
// 获取多空持仓人数比
const apiLongShortAccountRatio = '/api/v5/rubik/stat/contracts/long-short-account-ratio'
// 获取合约多空持仓人数比
const apiLongShortAccountRatioContract = '/api/v5/rubik/stat/contracts/long-short-account-ratio-contract'
// 获取杠杆多空比
const apiLoanRatio = '/api/v5/rubik/stat/margin/loan-ratio'
// 合约持仓量和交易量
const apiOpenInterestVolume = '/api/v5/rubik/stat/contracts/open-interest-volume'
// 获取主动买入/卖出交易量
const apiTakerVolume = '/api/v5/rubik/stat/taker-volume'
// 获取合约主动买入/卖出情况
const apiTakerVolumeContract = '/api/v5/rubik/stat/taker-volume-contract'
// 获取精英交易员合约多空持仓人数比
const apiLongShortAccountRatioContractTopTrader = '/api/v5/rubik/stat/contracts/long-short-account-ratio-contract-top-trader'
// 获取精英交易员合约多空持仓仓位比
const apiLongShortPositionRatioContractTopTraderPosition = '/api/v5/rubik/stat/contracts/long-short-position-ratio-contract-top-trader'

export const tradingDataFetch = {
	supportCoin: <T = any>() => useGet<ApiResult<T>>(baseUrl, apiSupportCoin),
	/**
	 * 获取多空持仓人数比
	 * 获取交割永续净开多持仓用户数与净开空持仓用户数的比值。
	 * @param ccy 币种 如 BTC
	 * @param period 周期 默认5分钟 时间粒度，默认值5m。支持[5m/1H/1D]
	 * 5m粒度最多只能查询两天之内的数据
	 * 1H粒度最多只能查询30天之内的数据
	 * 1D粒度最多只能查询180天之内的数据
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @returns
	 */
	longShortAccountRatio: <T = any>(ccy: string, period: Period = Period.M5, begin?: string, end?: string) =>
		useGet<ApiResult<T>>(baseUrl, apiLongShortAccountRatio, {
			ccy,
			begin,
			end,
			period
		}),
	/**
	 * 获取合约多空持仓人数比
	 * @param instId 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param period 时间粒度，默认值5m, 如 [5m/15m/30m/1H/2H/4H]
	 * 香港时间开盘价k线：[6H/12H/1D/2D/3D/5D/1W/1M/3M]
	 * UTC时间开盘价k线： [6Hutc/12Hutc/1Dutc/2Dutc/3Dutc/5Dutc/1Wutc/1Mutc/3Mutc]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @param limit 分页返回的结果集数量，最大为100，不填默认返回100条
	 * @returns
	 */
	longShortAccountRatioContract: <T = any>(instId: string, period: Period = Period.M5, begin?: string, end?: string, limit: number = 50) =>
		useGet<ApiResult<T>>(baseUrl, apiLongShortAccountRatioContract, {
			instId,
			begin,
			end,
			period,
			limit
		}),
	/**
	 * 获取杠杆多空比
	 * @param ccy 币种 如 BTC
	 * @param period 周期 默认5分钟 时间粒度，默认值5m。支持[5m/1H/1D]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @returns
	 */
	loanRatio: <T = any>(ccy: string, period: Period = Period.M5, begin?: string, end?: string) =>
		useGet<ApiResult<T>>(baseUrl, apiLoanRatio, {
			ccy,
			begin,
			end,
			period
		}),

	/**
	 * 获取合约持仓量和交易量
	 * @param ccy 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param period 时间粒度，默认值5m, 如 [5m/15m/30m/1H/2H/4H]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @returns
	 */
	openInterestVolume: <T = any>(ccy: string, period: Period = Period.M5, begin?: string, end?: string) =>
		useGet<ApiResult<T>>(baseUrl, apiOpenInterestVolume, {
			ccy,
			begin,
			end,
			period
		}),

	/**
	 * 获取主动买入/卖出交易量
	 * @param ccy 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param instType 产品类型 SPOT：币币 CONTRACTS：衍生品
	 * @param period 时间粒度，默认值5m。支持[5m/1H/1D]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @returns
	 */
	takerVolume: <T = any>(ccy: string, instType: InstanceType, period: Period = Period.M5, begin?: string, end?: string) =>
		useGet<ApiResult<T>>(baseUrl, apiTakerVolume, {
			ccy,
			instType,
			begin,
			end,
			period
		}),

	/**
	 * 获取合约多空持仓人数比
	 * @param instId 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param period 时间粒度，默认值5m, 如 [5m/15m/30m/1H/2H/4H]
	 * 香港时间开盘价k线：[6H/12H/1D/2D/3D/5D/1W/1M/3M]
	 * UTC时间开盘价k线： [6Hutc/12Hutc/1Dutc/2Dutc/3Dutc/5Dutc/1Wutc/1Mutc/3Mutc]
	 * @param unit 买入、卖出的单位，默认值是1 0: 币 1: 合约 2: U
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @param limit 分页返回的结果集数量，最大为100，不填默认返回100条
	 * @returns
	 */
	takerVolumeContract: <T = any>(instId: string, instType: InstanceType, period: Period = Period.M5, unit: '0' | '1' | '2' = '1', begin?: string, end?: string, limit: number = 50) =>
		useGet<ApiResult<T>>(baseUrl, apiTakerVolumeContract, {
			instId,
			unit,
			begin,
			end,
			period,
			limit
		}),
	/**
	 * 获取精英交易员合约多空持仓人数比
	 * @param instId 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param period 时间粒度，默认值5m, 如 [5m/15m/30m/1H/2H/4H]
	 * 香港时间开盘价k线：[6H/12H/1D/2D/3D/5D/1W/1M/3M]
	 * UTC时间开盘价k线： [6Hutc/12Hutc/1Dutc/2Dutc/3Dutc/5Dutc/1Wutc/1Mutc/3Mutc]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @param limit 分页返回的结果集数量，最大为100，不填默认返回100条
	 * @returns
	 */
	longShortAccountRatioContractTopTrader: <T = any>(instId: string, period: Period = Period.M5, begin?: string, end?: string, limit: number = 50) =>
		useGet<ApiResult<T>>(baseUrl, apiLongShortAccountRatioContractTopTrader, {
			instId,
			begin,
			end,
			period,
			limit
		}),
    
    /**
	 * 获取精英交易员合约多空持仓仓位比
	 * @param instId 产品ID，如 BTC-USDT 仅适用于交割，永续
	 * @param period 时间粒度，默认值5m, 如 [5m/15m/30m/1H/2H/4H]
	 * 香港时间开盘价k线：[6H/12H/1D/2D/3D/5D/1W/1M/3M]
	 * UTC时间开盘价k线： [6Hutc/12Hutc/1Dutc/2Dutc/3Dutc/5Dutc/1Wutc/1Mutc/3Mutc]
	 * @param begin 开始时间 如 1597026383085
	 * @param end 结束时间 如 1597026383011
	 * @param limit 分页返回的结果集数量，最大为100，不填默认返回100条
	 * @returns
	 */
	longShortPositionRatioContractTopTrader: <T = any>(instId: string, period: Period = Period.M5, begin?: string, end?: string, limit: number = 50) =>
		useGet<ApiResult<T>>(baseUrl, apiLongShortPositionRatioContractTopTraderPosition, {
			instId,
			begin,
			end,
			period,
			limit
		})
}
