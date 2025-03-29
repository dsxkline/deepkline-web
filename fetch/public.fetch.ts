import { ApiSource } from "~/types/types.d";
import { Okx } from "./okx";
import { useStore } from "~/store";
import { InstanceType } from "./okx/okx.type.d";

export const publicFetch = {
  /**
     * 
     * @param instType 产品类型
                        SPOT：币币
                        MARGIN：币币杠杆
                        SWAP：永续合约
                        FUTURES：交割合约
                        OPTION：期权
     * @param uly 标的指数，仅适用于交割/永续/期权，期权必填
     * @param instFamily 交易品种，仅适用于交割/永续/期权
     * @param instld 产品ID
     * @returns
     */
  getInstruments: (
    instType: InstanceType,
    uly: string = "",
    instFamily: string = "",
    instld: string = ""
  ) => {
    const state = useStore();
    const apiSource = state.apiSource;
    if (apiSource == ApiSource.OKX) {
      return Okx.publicFetch.instruments(instType, uly, instFamily, instld);
    }
    return Promise.reject("api source is not supported");
  },
};
