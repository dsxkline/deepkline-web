// 当前page设置为订阅收集器
export function useCurrentPageSubSymbols() {
	const subSymbols = ref<string[]>([])
	provide('registerPageSubSymbols', (symbols: string[]) => {
		symbols.forEach(symbol => {
			const exit = subSymbols.value.find(item => item == symbol)
			if (!exit) {
				subSymbols.value.push(symbol)
			}
		})
        //console.log('收集到品种',subSymbols.value)
	})

	return {
		subSymbols
	}
}

export function useAddPageSubSymbols() {
	const register = inject('registerPageSubSymbols', null) as unknown as ((symbols: string[]) => void) | undefined

	const addSubSymbols = (symbols: string[]) => {
		//console.log('useAddPageSubSymbols', register, symbols)
		register && register(symbols)
	}
	return {
		addSubSymbols
	}
}
