
export const formatPrice = (value:number,precision:number,prefix:string="") => {
    value = parseFloat(value.toString())
    const point = precision.toString().split('.')[1].length
    return `${prefix}${value.toFixed(point)}`;
};

export const formatChangeRate = (value:number,precision:number=2) => {
    value = parseFloat(value.toString())
    let point = precision
    // 如果出现很多小数点 例如 0.00000000234 会导致toFixed(2) 会变成 0.00
    // 小数点后需要寻找两位非0数字
    const str = value.toString()
    const index = str.indexOf('.')
    const zs = str.substring(0, index)
    if (index > -1 && zs==='0') {
        point = 0
        const subStr = str.substring(index + 1)
        let t = 0
        for (let i = 0; i < subStr.length; i++) {
            if (subStr[i] !== '0') {
                point = i + 1
                t += 1
                if (t >= precision) {
                    break
                }
            }
        }
    }
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value.toFixed(point)}`;
};

export const moneyFormat = (value:number,currency:string="") => {
    let unit = ''
    const precision=2
    value = parseFloat(value.toString())
    if (value >= 100000000) {
        value = value / 100000000
        unit = '亿'
    } else if (value >= 10000) {
        value = value / 10000
        unit = '万'
    }
    return currency+value.toFixed(precision)+unit;
};