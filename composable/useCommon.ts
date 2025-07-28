export function getCssVariable(variableName: string): string {
	const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
	return value
}

export function setCssVariable(variableName: string, value: string): void {
	document.documentElement.style.setProperty(variableName, value)
}

export const getHeaderHeight = () => {
	const headerHeight = getCssVariable('--header-height')
	return headerHeight ? parseFloat(headerHeight) : 0
}

export const getStatusBarHeight = () => {
	const statusBarHeight = getCssVariable('--status-bar-height')
	return statusBarHeight ? parseFloat(statusBarHeight) : 0
}

export const getNavHeight = () => {
    const navHeight = getCssVariable('--nav-height')
    return navHeight ? parseFloat(navHeight) : 0
}

export const getTabbarHeight = () => {
    const tabbarHeight = getCssVariable('--tabbar-height')
    return tabbarHeight ? parseFloat(tabbarHeight) : 0
}

export const getMenuHeight = () => {
    const menuHeight = getCssVariable('--menu-height')
    return menuHeight ? parseFloat(menuHeight) : 0
}