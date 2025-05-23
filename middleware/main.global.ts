import { Okx } from "~/fetch/okx";
import { InstanceType } from "~/fetch/okx/okx.type.d";
import { publicFetch } from "~/fetch/public.fetch";
import { useStore } from "~/store";
import { useSymbolStore } from "~/store/symbol";
import { ApiSource } from "~/types/types.d";

function getDefaultInstruments(InstanceType:InstanceType) {
    const symbolStore = useSymbolStore();
    publicFetch.getInstruments(InstanceType).then(res=>{
        if (res?.data) {
            symbolStore.setSymbols(res.data);
        }else{
            setTimeout(() => {
                getDefaultInstruments(InstanceType)
            }, 5000);
        }
    }).catch(err=>{
        console.error(err);
        setTimeout(() => {
            getDefaultInstruments(InstanceType)
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
        meta: [
            { name: 'theme-color', content: colorMode.value=="dark"?'#1e0b2c':'#ffffff' },
          ]
      })
    

    if (process.client) {
        const state = useStore();
        if (state.apiSource == ApiSource.OKX) {
            getDefaultInstruments(InstanceType.SPOT)
            getDefaultInstruments(InstanceType.SWAP)
        }
    }
})
