import type { CommonDto } from "./dtos/common";
import { useGet, usePost } from "./global.fetch";
const baseUrl = "https://jsonplaceholder.typicode.com/users/1"
const commonApi = baseUrl+'';
export const CommonFetch = {
    common:()=>usePost<CommonDto>(commonApi),
    getCommon:()=>useGet<CommonDto>(commonApi)
}