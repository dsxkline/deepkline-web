import { Okx } from "~/fetch/okx";
import { InstanceType } from "~/fetch/okx/okx.type.d";
import { publicFetch } from "~/fetch/public.fetch";
import { useStore } from "~/store";
import { useSymbolStore } from "~/store/symbol";
import { ApiSource } from "~/types/types.d";

function getDefaultInstruments() {
    const symbolStore = useSymbolStore();
    publicFetch.getInstruments(InstanceType.SPOT).then(res=>{
        if (res?.data) {
            symbolStore.setSymbols(res.data);
        }else{
            setTimeout(() => {
                getDefaultInstruments()
            }, 5000);
        }
    }).catch(err=>{
        console.error(err);
        setTimeout(() => {
            getDefaultInstruments()
        }, 5000);
    })
}

export default defineNuxtRouteMiddleware((to, from) => {
    // 服务端渲染主题
    const colorMode = useCookie('nuxt-color-mode', { default: () => 'dark' })
    useHead({
        htmlAttrs: {
          class:colorMode.value,
        },
      })
      
    if (process.client) {
        const state = useStore();
        if (state.apiSource == ApiSource.OKX) {
            getDefaultInstruments()
        }
    }
})
