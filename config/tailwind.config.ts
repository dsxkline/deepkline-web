import type { Config } from 'tailwindcss'
// 该方法是为了颜色基础类可以提供设置透明度的快捷方式，
const withOpacityValue: any = (variable: string) => {
	return ({ opacityValue }: { opacityValue?: string }) => {
		if (opacityValue !== undefined) {
			return `rgb(var(${variable}) / ${opacityValue})` // 支持 Tailwind 的 /20 等
		}
		return `rgb(var(${variable}))`
	}
}
// Default are on https://tailwindcss.nuxtjs.org/tailwind/config#default-configuration
export default <Partial<Config>>{
	darkMode: 'class',
	theme: {
		extend: {
			// 设置字体颜色基础类
			textColor: {
				highlight: withOpacityValue('--color-highlight'),
				main: withOpacityValue('--color-text-main'),
				muted: withOpacityValue('--color-text-muted'),
				invert: withOpacityValue('--color-text-invert'),
				green: withOpacityValue('--color-green'),
				red: withOpacityValue('--color-red'),
				grey: withOpacityValue('--color-text-grey'),
				brand: withOpacityValue('--color-text-brand')
			},
			// 设置背景颜色基础类
			// 其中 base 基础类是用于设置网页背景色，nav 基础类用于设置导航栏背景色
			// 其他的基础类是用于设置元素的填充背景色
			backgroundColor: {
				highlight: withOpacityValue('--color-highlight'),
				base: withOpacityValue('--color-bg-base'),
				nav: withOpacityValue('--color-bg-nav'),
				main: withOpacityValue('--color-fill-main'),
				muted: withOpacityValue('--color-fill-muted'),
				green: withOpacityValue('--color-green'),
				red: withOpacityValue('--color-red'),
				brand: withOpacityValue('--color-brand'),
				invert: withOpacityValue('--color-bg-invert')
			},
			// 设置渐变颜色基础类
			gradientColorStops: {
				highlight: withOpacityValue('--color-highlight')
			},
			// 设置表单外框阴影颜色基础类
			ringColor: {
				highlight: withOpacityValue('--color-highlight')
			},
			// 设置卡片阴影颜色基础类
			boxShadowColor: {
				highlight: withOpacityValue('--color-highlight')
			},
			// 设置边框颜色基础类
			borderColor: {
				highlight: withOpacityValue('--color-highlight')
			},
			// 设置光标颜色基础类
			caretColor: {
				highlight: withOpacityValue('--color-highlight')
			},
			// 设置表单强调色基础类
			accentColor: {
				highlight: withOpacityValue('--color-highlight')
			}
		}
	},
	plugins: [],
	content: []
}
