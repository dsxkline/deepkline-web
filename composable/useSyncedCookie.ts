// composables/useSyncedCookie.ts
import { useCookie, type CookieOptions } from '#app'

function getLocalStorage(key: string) {
    if(process.server) return
	return localStorage.getItem(key)
}
function setLocalStorage(key: string, val: string) {
    if(process.server) return
	return localStorage.setItem(key, val)
}
function removeLocalStorage(key: string) {
    if(process.server) return
	return localStorage.removeItem(key)
}

export function useSyncedCookie<T = string | null | undefined>(
	key: string,
	_opts?: CookieOptions<T> & {
		readonly?: false
	}
) {
	const cookie = useCookie<T>(key, _opts)

	// 初始化 localStorage
	const initValue = (cookie.value ? getLocalStorage(key) : null) as T
	if (initValue) {
		cookie.value = initValue
		localStorage.setItem(key, initValue as string)
	}

	return {
		get value() {
			// 优先从 cookie，其次 localStorage
			return (cookie.value ?? (getLocalStorage(key) || '') ?? '') as T
		},
		set value(val: T) {
			// 写入 Nuxt cookie
			cookie.value = val

			// 写入 localStorage
			if (val === null || val === undefined) removeLocalStorage(key)
			else setLocalStorage(key, val as string)
		}
	}
}
