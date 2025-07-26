import Decimal from 'decimal.js'

type Comparable = string | number | Decimal
type Operator = '>' | '>=' | '<' | '<=' | '==' | '!='
export class DecimalHelper {
	static add = (a: string | number, b: string | number) => new Decimal(a).plus(b)

	static sub = (a: string | number, b: string | number) => new Decimal(a).minus(b)

	static mul = (a: string | number, b: string | number) => new Decimal(a).times(b)

	static div = (a: string | number, b: string | number) => new Decimal(a).dividedBy(b)
	static compare(a: Comparable, operator: Operator, b: Comparable): boolean {
		const decA = new Decimal(a)
		const decB = new Decimal(b)

		switch (operator) {
			case '>':
				return decA.gt(decB)
			case '>=':
				return decA.gte(decB)
			case '<':
				return decA.lt(decB)
			case '<=':
				return decA.lte(decB)
			case '==':
				return decA.eq(decB)
			case '!=':
				return !decA.eq(decB)
			default:
				throw new Error(`Unsupported operator "${operator}"`)
		}
	}
}
