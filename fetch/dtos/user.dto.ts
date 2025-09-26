import type { MessageEvents } from "../dk/dk.websocket"

export interface LoginReqDto {
	userName: string
	password?: string
	validId?: string
	ticket?: string
	randstr?: string
}

export interface UserDto {
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
	country: string
	appleOpenId: string
	editNicknameTimes: number
	editFaceTimes: number
}

export interface MessageDto {
	id: number
	type: MessageType
	title: string
	content: string
	event: MessageEvents
	category: MessageCategory
	userId: string
	isRead: boolean
	payload: Record<string, any>
	createdAt: Date
	updatedAt: Date
	readAt: Date
}

export enum MessageType {
	BROADCAST = 'broadcast', // 广播
	USER = 'user' // 用户
}

export enum MessageCategory {
	SYSTEM = 'system', // 系统
	TRADE = 'trade', // 交易
	WARNING = 'warning' // 价格预警，强平预警
}
export interface MessageRespDto {
	list: MessageDto[]
	total: number
	page: number
	pageSize: number
}

export interface MessageUnReadRespDto {
	total: number
	system: {
		content: MessageDto
		count: number
	}
	trade: {
		content: MessageDto
		count: number
	}
	warning: {
		content: MessageDto
		count: number
	}
}
