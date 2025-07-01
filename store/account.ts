import { AccountDto, FundDto } from '~/fetch/dtos/account'
import type { ExchangeDto } from '~/fetch/dtos/exchange'

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
			const accountsCookie = parseInt(useCookie('account').value || '0')
			if (this.accounts?.length) {
				const account = this.accounts.find(item => item.accountId == accountsCookie)
				// 不存在取第一个
				if (!account) {
					useCookie('account').value = String(this.accounts[0].accountId)
					this.currentAccount = this.accounts[0]
				} else {
					this.currentAccount = account
				}
			}else{
				this.currentAccount = null
				this.fund = null
				useCookie('account').value = null

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
		}
	},
	getters: {
		getExchange(state) {
			return (slug: string) => state.exchanges.find(item => item.slug == slug)
		}
	}
})
