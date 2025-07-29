export interface ExchangeDto {
	id: number
	name: string
	slug: string
	website: string
	apiBaseUrl: string
	apiKeyRequired: boolean
	region: string
	status: number
	logoUrl: string
	description: string
	createdAt: Date
	updatedAt: Date
	secretKeyRequired: boolean
	passphraseRequired: boolean
	isOauth: boolean
	isReal: boolean
	isDemo: boolean
	isLocal: boolean
	minDeposit: number
	maxLeverage: number
	takerFee: number
}

export interface UpDownsDto {
	up: number
	down: number
	unChanges: number
	total: number
}

export interface FearDto {
	value: number
	slug: string
	desc: string
}

export interface MarketSectorDto {
	name: string
	enName: string
	rate: number
	topCoins: string | null
	sectorId: number
}
