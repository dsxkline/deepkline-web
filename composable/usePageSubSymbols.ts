// 当前page设置为订阅收集器
export function useCurrentPageSubSymbols() {
	const subSymbols = ref<string[]>([])
	provide('registerPageSubSymbols', (symbols: string[], remove?: boolean) => {
		symbols.forEach(symbol => {
			const exit = subSymbols.value.findIndex(item => item == symbol)
			if (exit < 0) {
				subSymbols.value.push(symbol)
			} else {
				if (remove) subSymbols.value.splice(exit, 1)
			}
		})
		//console.log('收集到品种',subSymbols.value)
	})

	return {
		subSymbols
	}
}

export function useAddPageSubSymbols() {
	const register = inject('registerPageSubSymbols', null) as unknown as ((symbols: string[], remove?: boolean) => void) | undefined

	const addSubSymbols = (symbols: string[]) => {
		//console.log('useAddPageSubSymbols', register, symbols)
		register && register(symbols)
	}
	const removeSubSymbols = (symbols: string[]) => {
		//console.log('useAddPageSubSymbols', register, symbols)
		register && register(symbols, true)
	}
	return {
		addSubSymbols,
		removeSubSymbols
	}
}
