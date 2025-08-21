// 当前page设置为订阅收集器
export function useCurrentPageSubSymbols() {
	const subSymbolsMap = ref<Record<string, string[]>>({})
	provide('registerPageSubSymbols', (symbols: string[], pageId: string, remove?: boolean) => {
		symbols.forEach(symbol => {
			subSymbolsMap.value[pageId] = subSymbolsMap.value[pageId] || []
			const exit = subSymbolsMap.value[pageId].findIndex(item => item == symbol)
			if (exit < 0) {
				subSymbolsMap.value[pageId].push(symbol)
			} else {
				if (remove) subSymbolsMap.value[pageId].splice(exit, 1)
			}
		})
		subSymbols.value = [...new Set(Object.values(subSymbolsMap.value).flat())]
		// console.log('收集到品种', subSymbolsMap.value)
	})

	const subSymbols = ref<string[]>([])

	return {
		subSymbols
	}
}

export function useAddPageSubSymbols() {
	const instance = getCurrentInstance()
	// 页面唯一标识
	const pageId = String(instance?.uid)
	const register = inject('registerPageSubSymbols', null) as unknown as ((symbols: string[], pageId: string, remove?: boolean) => void) | undefined

	const addSubSymbols = (symbols: string[]) => {
		// console.log('useAddPageSubSymbols', register, symbols, pageId)
		register && register(symbols, pageId, false)
	}
	const removeSubSymbols = (symbols: string[]) => {
		//console.log('useAddPageSubSymbols', register, symbols)
		register && register(symbols, pageId, true)
	}
	return {
		addSubSymbols,
		removeSubSymbols
	}
}
