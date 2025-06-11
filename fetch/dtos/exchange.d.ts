export class ExchangeDto {
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
}
