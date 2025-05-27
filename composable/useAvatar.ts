export function useAvatar(name?: string, avatar?: string): string {
	return avatar || (name ? `https://api.dicebear.com/7.x/identicon/svg?seed=${name}` : 'https://api.dicebear.com/7.x/identicon/svg?seed=default')
}
