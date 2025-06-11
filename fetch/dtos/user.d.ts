export class LoginReqDto {
	userName: string
	password?: string
	validId?: string
	ticket?: string
	randstr?: string
}

export class UserDto {
	userName: string
	nickName: string
	token: string
	id: number
	tel: string
	realName: string
	idcard: string
	face: string
	coin: number
	integs: number
	openId: string
	email: string
	createdAt: string
	updatedAt: string
	cancelTime: string
	levelCode: string
	appleOpenId: string
	editNicknameTimes:number
	editFaceTimes:number
}
