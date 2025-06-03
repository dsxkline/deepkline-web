import type { ApiResult } from "~/types/types";
import { useGet, usePost } from "./global.fetch";
import config from "~/config/config";
import type { LoginReqDto, userRespDto } from "./dtos/user";
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const loginApi = '/user/login';

export const userFetch = {
   
    /**
     * 登录
     * @param userName 账号
     * @param password 密码
     * @param smsCode 验证码
     * @returns 
     */
    login:(params:LoginReqDto)=>usePost<ApiResult<userRespDto>>(baseUrl,loginApi,{
        ...params
    })
}