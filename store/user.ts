import { UserRespDto } from '~/fetch/dtos/user'

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		user: null as UserRespDto | null
	}),
	actions: {
		setUser(payload: UserRespDto | null) {
			this.user = payload
		},
		logout() {
			this.user = null
            useCookie('token').value = null
		}
	}
})
