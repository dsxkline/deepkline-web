import type { AccountDto, FundDto } from '~/fetch/dtos/account.dto'
import type { ExchangeDto } from '~/fetch/dtos/exchange.dto'
import { useOrderStore } from './order'
import { useSyncedCookie } from '~/composable/useSyncedCookie'

export const useAccountStore = defineStore({
	id: 'account',
	state: () => ({
		accounts: [] as AccountDto[],
		exchanges: [] as ExchangeDto[],
		currentAccount: null as AccountDto | null | undefined,
		fund: null as FundDto | null
	}),
	actions: {
		setAccounts(payload: AccountDto[]) {
			this.accounts = payload
			// 设置当前账号
			const accountsCookie = parseInt(useSyncedCookie('account').value || '0')
			if (this.accounts?.length) {
				const account = this.accounts.find(item => item.accountId == accountsCookie)
				// 不存在取第一个
				if (!account) {
					useSyncedCookie('account').value = String(this.accounts[0].accountId)
					this.currentAccount = this.accounts[0]
				} else {
					this.currentAccount = account
				}
			} else {
				this.currentAccount = null
				this.fund = null
				useSyncedCookie('account').value = null
			}
		},
		getAccount(accountId: number) {
			return this.accounts.find(item => item.accountId == accountId)
		},
		setExchanges(payload: ExchangeDto[]) {
			this.exchanges = payload
		},
		setFund(payload: FundDto) {
			this.fund = payload
		},
		reset(accountId:number){
			useOrderStore().orders = []
			useOrderStore().positions = []
			useOrderStore().assets = []
		}

	},
	getters: {
		getExchange(state) {
			return (slug: string) => state.exchanges.find(item => item.slug == slug)
		}
	}
})
