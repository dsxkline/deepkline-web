import type { CommonDto } from "./dtos/common";
import { useGet, usePost } from "./global.fetch";
const baseUrl = "https://jsonplaceholder.typicode.com"
const commonApi = '/users/1';
export const commonFetch = {
    common:()=>usePost<CommonDto>(baseUrl,commonApi),
    getCommon:()=>useGet<CommonDto>(baseUrl,commonApi)
}