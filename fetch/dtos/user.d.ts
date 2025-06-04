export class LoginReqDto {
	userName: string
	password?: string
	smsCode: string
}

export class UserRespDto {
	userName: string
	nickName: string
	token: string
	id: number
	tel: string
	realName: string
	idcard: string
	face: string
	coin: number | null
	integs: number | null
	openId: string | null
    email:string
    createdAt:string
    updatedAt:string
    cancelTime:string
    levelCode:string
    appleOpenId:string
}
