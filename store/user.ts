import type { AccountDto } from '~/fetch/dtos/account'
import type { ExchangeDto } from '~/fetch/dtos/exchange'
import { UserDto } from '~/fetch/dtos/user'

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		user: null as UserDto | null,
		accounts: [] as AccountDto[],
		exchanges: [] as ExchangeDto[]
	}),
	actions: {
		setUser(payload: UserDto | null) {
			this.user = payload
		},
		logout() {
			this.user = null
			this.accounts = []
			useCookie('token').value = null
		},
		setAccounts(payload: AccountDto[]) {
			this.accounts = payload
		},
		setExchanges(payload: ExchangeDto[]) {
			this.exchanges = payload
		}
	},
	getters: {
		getExchange(state) {
			return (slug: string) => state.exchanges.find(item => item.slug == slug)
		}
	}
})
