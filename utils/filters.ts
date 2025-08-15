import { number } from 'echarts'
import moment from 'moment'
import { isVNode } from 'vue'
import { MarketType, type SymbolDto } from '~/fetch/dtos/symbol.dto'

// 价格常规四舍五入
export const formatPrice = (value: any, precision: string, prefix: string = '') => {
	if (!precision) return value + ''
	if (!value) return value
	value = parseFloat(value.toString())
	const point = precision.toString().indexOf('.') > 0 ? precision.toString().split('.')[1].length : precision
	// console.log('formatPrice',value,point)
	return thousandUnit(`${prefix}${value.toFixed(point)}`)
}

// 资产金额正负上下取整
export const formatNumber = (value: any, precision: string, prefix: string = '') => {
	if (!precision) return value + ''
	if (!value) return value
	value = parseFloat(value.toString())
	let point = precision.toString().indexOf('.') > 0 ? precision.toString().split('.')[1].length : parseInt(precision)
	if (String(value).indexOf('.') > 0) {
		const px = String(value).split('.')[1]
		point = Math.max(parseInt(String(point)), px.length - String(parseInt(px)).length + 1)
	}
	return thousandUnit(`${prefix}${noExponents(String(toNumberFixed(value, String(point))))}`)
}

// 去掉后面的0，返回纯数字
export const numberToFixed = (value: any, precision: string, prefix: string = '') => {
	if (!precision) return value + ''
	if (!value) return value
	value = parseFloat(value.toString())
	let point = precision.toString().indexOf('.') > 0 ? precision.toString().split('.')[1].length : parseInt(precision)
	// console.log('value', value, value.toFixed(point))
	if (String(value).indexOf('.') > 0) {
		const px = String(value).split('.')[1]
		point = Math.max(parseInt(String(point)), px.length - String(parseInt(px)).length + 1)
		// console.log('value', value, point)
	}
	return `${prefix}${noExponents(String(parseFloat(value.toFixed(point))))}`
}

// 正数向下取，负数向上取
export const toNumberFixed = (value: any, precision: string): number => {
	if (!precision) return value
	if (!value) return value
	value = parseFloat(value.toString())
	const point = precision.toString().indexOf('.') > 0 ? precision.toString().split('.')[1].length : parseInt(precision)
	const factor = Math.pow(10, point)
	if (value >= 0) {
		return Math.floor(value * factor) / factor
	} else {
		return Math.ceil(value * factor) / factor
	}
}

export const thousandUnit = (num: any) => {
	num = num + ''
	const [intPart, decimalPart] = num.toString().split('.')
	const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return decimalPart != undefined ? `${formattedInt}.${decimalPart}` : formattedInt
}

export const formatChangeRate = (value: any, precision: number = 2) => {
	value = parseFloat(value.toString())
	let point = precision
	// 如果出现很多小数点 例如 0.00000000234 会导致toFixed(2) 会变成 0.00
	// 小数点后需要寻找两位非0数字
	const str = value.toString()
	const index = str.indexOf('.')
	const zs = str.substring(0, index)
	if (index > -1 && zs === '0') {
		point = 0
		const subStr = str.substring(index + 1)
		let t = 0
		for (let i = 0; i < subStr.length; i++) {
			if (subStr[i] !== '0' || t > 0) {
				point = i + 1
				t += 1
				if (t >= precision) {
					break
				}
			}
		}
	}
	const prefix = value > 0 ? '+' : ''
	return `${prefix}${value.toFixed(point)}`
}

export const moneyFormat = (value: any, currency: string = '', precision: string = '2', m: string = '亿', k: string = '万') => {
	let unit = ''
	value = parseFloat(value.toString())
	// const precision = value.toString().indexOf('.')>0?value.toString().split(".")[1].length:0 || 2;
	const point = precision.toString().indexOf('.') > 0 ? precision.toString().split('.')[1].length : precision
	if (Math.abs(value) >= 100000000) {
		value = value / 100000000
		unit = m
	} else if (Math.abs(value) >= 10000) {
		value = value / 10000
		unit = k
	}
	return currency + thousandUnit(parseFloat(value.toFixed(point))) + unit
}

export function noExponents(num: any) {
	const nb = parseFloat(String(num))
	const data = String(num).split(/[eE]/)
	if (data.length === 1) return data[0]

	let z = '',
		sign = nb < 0 ? '-' : '',
		str = data[0].replace('.', ''),
		mag = Number(data[1]) + 1

	if (mag < 0) {
		z = sign + '0.' + '0'.repeat(Math.abs(mag)) + str.replace('-', '')
	} else {
		z = str + '0'.repeat(mag - str.length)
	}
	return z
}

export function debounce(fn: (...args: any[]) => void, delay: number) {
	let timer: NodeJS.Timeout
	return (...args: any[]) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), delay)
	}
}

export function formatDate(t: number, format: string) {
	return moment(t).format(format)
}

export function trimMap(map: Map<any, any>, MAX_ORDER_DEPTH: number) {
	const sorted = Array.from(map.entries())
	if (sorted.length > MAX_ORDER_DEPTH) {
		const trimmed = sorted.slice(0, MAX_ORDER_DEPTH)
		map.clear()
		trimmed.forEach(([price, entry]) => map.set(price, entry))
	}
}

export function getSymbolName(symbol: SymbolDto) {
	if (!symbol) return
	return symbol.marketType == MarketType.SPOT ? symbol.baseCoin + '/' + symbol.quoteCoin : symbol.baseCoin + symbol.quoteCoin
}

export function phoneStar(value: string) {
	const len = Math.floor(value.length / 3)
	const star = Array.from(value.substring(len, 2 * len + 1))
		.map(() => '*')
		.join('')
	const vals = value.substring(0, len) + star + value.substring(value.length - len - 1, value.length)
	// console.log(value,value.substring(len,2*len),star,len,vals);
	return vals
}

export function emailStar(value: string) {
	const preStr = value.split('@')[0]
	const domainStr = value.split('@')[1]
	return phoneStar(preStr) + '@' + domainStr
}

/**
 * 判断是否是 VNode 或 VNode 数组
 * @param value 任意值
 * @returns boolean
 */
export function isVNodeLike(value: unknown): value is VNode | VNode[] {
	if (isVNode(value)) return true
	if (Array.isArray(value)) {
		return value.every(item => isVNode(item))
	}
	return false
}

export function generateSimilarColors(baseColor: string, count: number, variance = 30): string[] {
	let [r, g, b] = baseColor.split(' ')
	if (baseColor.indexOf('#')>=0) {
		const base = baseColor.replace('#', '')
		r = String(parseInt(base.substring(0, 2), 16))
		g = String(parseInt(base.substring(2, 4), 16))
		b = String(parseInt(base.substring(4, 6), 16))
	}

	const colors: string[] = []

	for (let i = 0; i < count; i++) {
		const newR = Math.min(255, Math.max(0, parseInt(r) + Math.floor(Math.random() * (2 * variance + 1)) - variance))
		const newG = Math.min(255, Math.max(0, parseInt(g) + Math.floor(Math.random() * (2 * variance + 1)) - variance))
		const newB = Math.min(255, Math.max(0, parseInt(b) + Math.floor(Math.random() * (2 * variance + 1)) - variance))
		const hex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
		colors.push(hex)
	}

	return colors
}

/**
 * 计算点在区间左右的百分比距离
 * @param x 当前点
 * @param L 区间左边界
 * @param R 区间右边界
 * @returns { leftPercent: number, rightPercent: number } 左右距离百分比，范围 0~1
 */
export function distancePercent(x: number, L: number, R: number) {
  const total = R - L
  if (total <= 0) return { leftPercent: 0, rightPercent: 0 } // 防止除零
  const leftPercent = parseFloat(((x - L) / total * 100).toFixed(2)) // 距离左边占总长度比例
  const rightPercent = parseFloat(((R - x) / total * 100).toFixed(2)) // 距离右边占总长度比例
  return { leftPercent, rightPercent }
}