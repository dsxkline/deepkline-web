import type { MessageUnReadRespDto, UserDto } from '~/fetch/dtos/user.dto'
import { useAccountStore } from './account'
import { useOrderStore } from './order'
import { useSyncedCookie } from '~/composable/useSyncedCookie'

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		user: null as UserDto | null,
		unRead: {} as MessageUnReadRespDto | null
	}),
	actions: {
		setUser(payload: UserDto | null) {
			this.user = payload
		},
		logout() {
			this.user = null
			useAccountStore().accounts = []
			useAccountStore().currentAccount = null
			useAccountStore().fund = null
			useOrderStore().orders = []
			useOrderStore().positions = []
			useOrderStore().assets = []
			useSyncedCookie('token').value = null
		},
		setUnRead(payload: MessageUnReadRespDto | null) {
			this.unRead = payload
		},
		// 来消息未读加1
		addUnRead() {
			if (!this.unRead) return
			this.unRead.total = (this.unRead?.total || 0) + 1
		}
	},
	getters: {}
})
