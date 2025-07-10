import type { UserDto } from '~/fetch/dtos/user.dto'
import { useAccountStore } from './account'

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		user: null as UserDto | null,
	}),
	actions: {
		setUser(payload: UserDto | null) {
			this.user = payload
		},
		logout() {
			this.user = null
			useAccountStore().accounts = []
			useCookie('token').value = null
		},
	},
	getters: {
		
	}
})
