import { useGet, usePost } from "../global.fetch";
import { Period, type Instruments } from "./okx.type.d";
const baseUrl = "/api/okx";

const longShortAccountRatio = "/api/v5/rubik/stat/contracts/long-short-account-ratio";

export const tradingDataFetch = {
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
    longShortAccountRatio: (ccy: string, period: Period = Period.M5, begin: string = "", end: string = "") =>
        useGet<Instruments>(baseUrl, longShortAccountRatio, {
            ccy,
            begin,
            end,
            period
        })
};
