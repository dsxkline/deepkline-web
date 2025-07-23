type AnimationOptions = {
	from: number
	to: number
	duration?: number // ms，默认 300
	loop?: boolean // 是否循环
	easing?: (t: number) => number // 自定义缓动函数（默认线性）
	onUpdate: (value: number) => void
	onFinish?: () => void
}

export function easeInOut(t: number) {
	// 常用的 ease-in-out 缓动函数（可替换为贝塞尔曲线或其他）
	return t < 0.5
		? 2 * t * t // ease-in 前半段
		: -1 + (4 - 2 * t) * t // ease-out 后半段
}
export const liner = (t: number) => t // 线性过渡

export type requestAnimationType = {
	start: (options: AnimationOptions) => void
	stop: () => void
}

export function useRequestAnimation(): requestAnimationType {
	const defaultEasing = easeInOut // (t: number) => t // 线性过渡
	let animationFrameId: number | null = null
	let startTimestamp: number | null = null
	let _duration: number = 300 // 默认 300ms
	let _easing: (t: number) => number = defaultEasing
	let _onUpdate: ((value: number) => void) | null = null
	let _onFinish: (() => void) | undefined | null = undefined
	let _from: any = null
	let _to: any = null
	let _loop: boolean | undefined = false
	let _isStop :boolean = false

	const start = ({ from, to, duration = 300, easing = defaultEasing, onUpdate, onFinish, loop }: AnimationOptions) => {
		_from = from
		_to = to
		_duration = duration
		_easing = easing
		_onUpdate = onUpdate
		_onFinish = onFinish
		_loop = loop
		// 先取消上一个动画
		stop()
		_isStop = false
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
		if(_isStop) return
		if (progress < 1) {
			animationFrameId = requestAnimationFrame(step)
		} else {
			_onFinish?.()
			if (!_loop) stop()
			else {
				const to = _to
				_to = _from
				_from = to
				// 循环往复
				startTimestamp = timestamp
				animationFrameId = requestAnimationFrame(step)
			}
		}
	}

	const stop = () => {
		_isStop = true
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
			// _onUpdate && _onUpdate(_to)
			// _onUpdate = null
			_onFinish = null
		}
		startTimestamp = null
	}

	return { start, stop }
}
