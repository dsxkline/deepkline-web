export function useAvatar(name?: string, avatar?: string): string {
	return avatar || (name ? `https://api.dicebear.com/9.x/bottts/svg?${name}` : 'https://api.dicebear.com/9.x/bottts/svg?seed=default')
}
