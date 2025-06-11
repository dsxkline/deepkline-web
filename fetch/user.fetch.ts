import type { ApiResult } from '~/types/types'
import { useGet, usePost } from './global.fetch'
import config from '~/config/config'
import type { LoginReqDto, UserDto } from './dtos/user'
import type { CheckEmailReqDto, CheckEmailRespDto } from './dtos/check-email'
let baseApi = config.BASE_API_URL
if (typeof window != 'undefined' && window.__NUXT__) baseApi = window.__NUXT__?.config.public.BASE_API_URL
// console.log('__NUXT__', config, process.client, baseApi)
const baseUrl = baseApi + '/v1' // "/api/okx";
const loginApi = '/user/login'
const checkEmailApi = '/user/checkemail'
const sendsmsApi = '/user/sendsms'
const chackverificationcodeApi = '/user/checkverificationcode'
const resetApi = '/user/reset'
const userInfoApi = '/user/info'
const nickFaceApi = '/user/nickface/update'
const faceHistoryApi = '/user/face/history'
const uploadPhotoApi = '/user/upload'

export const userFetch = {
	/**
	 * 登录
	 * @returns
	 */
	login: (params: LoginReqDto) =>
		usePost<ApiResult<UserDto>>(baseUrl, loginApi, {
			...params
		}),

	/**
	 * 检查邮箱账户是否存在
	 * @param params 请求体
	 * @returns
	 */
	checkEmail: (params: CheckEmailReqDto) =>
		usePost<ApiResult<CheckEmailRespDto>>(baseUrl, checkEmailApi, {
			...params
		}),

	/**
	 * 检验验证码是否正确
	 * @param email 邮箱地址
	 * @param code 验证码
	 * @returns validId
	 */
	checkVerificationCode: (email: string, code: string) =>
		usePost<ApiResult<{ validId: string }>>(baseUrl, chackverificationcodeApi, {
			email,
			code
		}),

	/**
	 * 发送邮箱验证码
	 * @param email 邮箱地址
	 * @param type 验证码类型 0=登录 1=注册 2=忘记密码 3=绑定手机号
	 * @param ticket 用户行为票据
	 * @param randstr 用户行为随机数
	 * @param userIp 客户端IP
	 * @returns
	 */
	sendEmailCode: (email: string, type: number = 0, ticket?: string, randstr?: string, userIp?: string) =>
		usePost<ApiResult<null>>(baseUrl, sendsmsApi, {
			email,
			type,
			ticket,
			randstr,
			userIp
		}),
	/**
	 * 重置密码
	 * @param email 邮箱地址
	 * @param password 密码
	 * @param validId 验证ID
	 * @returns
	 */
	resetPassword: (email: string, password: string, validId: string) =>
		usePost<ApiResult<boolean>>(baseUrl, resetApi, {
			email,
			password,
			validId
		}),

	/**
	 * 获取用户详情
	 * @returns 
	 */
	getUser: () => usePost<ApiResult<UserDto>>(baseUrl, userInfoApi, {}),

	/**
	 * 修改昵称或头像
	 * @param nickName 昵称
	 * @param face 头像
	 * @returns 
	 */
	updateNickFace: (nickName?: string, face?: string) => usePost<ApiResult<boolean>>(baseUrl, nickFaceApi, { nickName, face }),

	/**
	 * 头像上传地址
	 * @returns 
	 */
	getUploadUrl: () => baseUrl + uploadPhotoApi,

	/**
	 * 获取用户头像历史列表
	 * @returns 头像历史列表
	 */
	getFaceHistory: () => usePost<ApiResult<string[]>>(baseUrl, faceHistoryApi, {})
}
