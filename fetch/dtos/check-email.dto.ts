export interface CheckEmailReqDto {
	email: string
}

export interface CheckEmailRespDto {
	email: string
	isRegister: boolean
	isValid: boolean
	openCaptcha: boolean
}
