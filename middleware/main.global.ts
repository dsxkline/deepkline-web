import { Okx } from "~/fetch/okx";
import { InstanceType } from "~/fetch/okx/okx.type.d";
import { useStore } from "~/store";
import { useSymbolStore } from "~/store/symbol";
import { ApiSource } from "~/types/types.d";

export default defineNuxtRouteMiddleware(async (to, from) => {
    // console.log(to,from);
    if (process.client) {
        const state = useStore();
        if (state.apiSource == ApiSource.OKX) {
            const symbolStore = useSymbolStore();
            const res = await Okx.publicFetch.instruments(InstanceType.SPOT);
            console.log(res);
            if (res?.data) {
                symbolStore.setSymbols(res.data);
            }
        }
    }
})
