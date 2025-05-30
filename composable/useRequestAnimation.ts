type AnimationOptions = {
	from: number
	to: number
	duration?: number // ms，默认 300
	easing?: (t: number) => number // 自定义缓动函数（默认线性）
	onUpdate: (value: number) => void
	onFinish?: () => void
}

export function useRequestAnimation() {
	const defaultEasing = (t: number) => t // 线性过渡
	let animationFrameId: number | null = null
	let startTimestamp: number | null = null
	let _duration: number = 300 // 默认 300ms
	let _easing: (t: number) => number = defaultEasing
	let _onUpdate: ((value: number) => void) | null = null
	let _onFinish: (() => void) | undefined = undefined
	let _from: any = null
	let _to: any = null

	const start = ({ from, to, duration = 300, easing = defaultEasing, onUpdate, onFinish }: AnimationOptions) => {
		_from = from
		_to = to
		_duration = duration
		_easing = easing
		_onUpdate = onUpdate
		_onFinish = onFinish
		// 先取消上一个动画
		stop()
		startTimestamp = null
		animationFrameId = requestAnimationFrame(step)
	}

	const step = (timestamp: number) => {
		if (!startTimestamp) startTimestamp = timestamp
		const elapsed = timestamp - startTimestamp
		const progress = Math.min(elapsed / _duration, 1)
		const easedProgress = _easing(progress)

		const currentValue = _from + (_to - _from) * easedProgress
		_onUpdate && _onUpdate(currentValue)

		if (progress < 1) {
			animationFrameId = requestAnimationFrame(step)
		} else {
			_onFinish?.()
			stop()
		}
	}

	const stop = () => {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
		startTimestamp = null
	}

	return { start, stop }
}
