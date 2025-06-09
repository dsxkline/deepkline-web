export class AccountDto {
	id: number // 主键
	accountId: number // 账户ID
	userId: number // 用户 ID
	exchange: string // 交易所标识，如 'okx'
	accountName?: string // 账号备注名（可选）
	apiKey: string // API Key（通常加密存储，不应在前端返回）
	apiSecret: string // API Secret（通常加密存储）
	apiPassphrase?: string // API passphrase（如 OKX 必须）
	status: 0 | 1 | 2 // 状态：0=禁用，1=启用，2=异常
	isCurrent: boolean // 是否为当前使用账号
	bindTime: string // 绑定时间（ISO 格式）
	lastSyncTime?: string // 最后同步时间
	createdAt: string // 创建时间
	updatedAt: string // 更新时间
}
