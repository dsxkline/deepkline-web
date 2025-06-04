export class CheckEmailReqDto {
	email: string
}

export class CheckEmailRespDto {
	email: string
	isRegister: boolean
	isValid: boolean
}
