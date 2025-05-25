// directives/v-swipe-down.ts
import type { Directive } from 'vue'
function isScrollable(el: HTMLElement) {
	if (!el || el === document.body) return false
	const style = window.getComputedStyle(el)
	const overflowY = style.overflowY
	const isScrollY = overflowY === 'auto' || overflowY === 'scroll'
	const canScroll = el.scrollHeight > el.clientHeight && el.scrollTop>0
	return (isScrollY && canScroll)
}

function findScrollableParent(el: HTMLElement | null) {
	while (el && el !== document.body) {
		if (isScrollable(el)) {
      return el
    }
		el = el.parentElement
	}
	return null
}
export const vSwipeDown: Directive<HTMLElement, number> = {
	mounted(el, binding) {
		if (!binding?.value) return
		const callback = typeof binding.value === 'function' ? binding.value : (binding.value as any)?.callback
		let startX = 0
		let startY = 0
		let endX = 0
		let endY = 0
		let startT = 0
		let endT = 0
		let once = 0
		let lockDirection = 0
		// 首次方向,不能是向上
		let firstDirection = 0
		function touchStart(e: TouchEvent) {
			const scrollable = findScrollableParent(e.target as HTMLElement)
			if (scrollable) {
				// e.preventDefault() // 🚫 阻止页面滚动
        e.stopPropagation()
        return;
			}
			startY = e.touches[0].clientY
			startX = e.touches[0].clientX
			endY = e.touches[0].clientY
			endX = e.touches[0].clientX
			startT = Date.now()
			once = 0
			lockDirection = 0
			// 首次方向
			firstDirection = 0
		}

		function touchMove(e: TouchEvent) {
			const scrollable = findScrollableParent(e.target as HTMLElement)
			if (scrollable) {
				// e.preventDefault() // 🚫 阻止页面滚动
        e.stopPropagation()
        return;
			}
      console.log('touchmove',e.target)
			// 获取结束触摸点的纵坐标
			endY = e.touches[0].clientY
			endX = e.touches[0].clientX
			endT = Date.now()
			// 计算滑动距离
			var distance = endY - startY
			var time = endT - startT
			const direction = lockDirection ? lockDirection : getDirection(startX, startY, endX, endY)
			// console.log('touchMove',distance,time,direction,e)
			lockDirection = direction
			if (firstDirection == 0) firstDirection = direction
			if (firstDirection != 2) return
			// 在这里可以根据滑动距离做相应的处理
			if (direction == 1 || direction == 2) {
				// 执行向下滑动后的操作
				callback(distance, time)
			}
		}
		function touchEnd(e: TouchEvent) {
      const scrollable = findScrollableParent(e.target as HTMLElement)
			if (scrollable) {
				// e.preventDefault() // 🚫 阻止页面滚动
        e.stopPropagation()
        return;
			}
			endT = Date.now()
			//   e.preventDefault();
			// 计算滑动距离
			var distance = endY - startY
			var time = endT - startT
			const direction = getDirection(startX, startY, endX, endY)
			if (firstDirection != 2) return
			// console.log('touchEnd',distance,time)

			// 在这里可以根据滑动距离做相应的处理
			if (direction == 1 || direction == 2) {
				// 执行向下滑动后的操作
				callback(distance, time, true)
			}
		}

		function getDirection(x1: number, y1: number, x2: number, y2: number) {
			const dx = x2 - x1
			const dy = y2 - y1

			// console.log('水平移动',dx,'垂直移动',dy);
			// 判断水平方向和垂直方向的差异
			if (Math.abs(dx) > Math.abs(dy)) {
				// 水平移动更多，判断左右
				return dx > 0 ? 4 : 3
			} else {
				// 垂直移动更多，判断上下
				return dy > 0 ? 2 : 1
			}
		}

		//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
		// function getDirection(startx, starty, endx, endy) {
		//   let angx = endx - startx;
		//   let angy = endy - starty;
		//   let result = 0;
		//   // 夹角
		//   const start = 90 - 20;
		//   const end = 90 + 20;

		//   let angle = getAngle(angx, angy);
		//   if (angle >= -end && angle <= -start) {
		//     result = 1;
		//   } else if (angle > start && angle < end) {
		//     result = 2;
		//   } else if (
		//     (angle >= end && angle <= 180) ||
		//     (angle >= -180 && angle < -end)
		//   ) {
		//     result = 3;
		//   } else if (angle >= -start && angle <= start) {
		//     result = 4;
		//   }
		//   console.log('角度',angle);
		//   return result;
		// }
		/**
		 * 获得角度
		 * @param {float} angx
		 * @param {float} angy
		 * @returns
		 */
		function getAngle(angx: number, angy: number) {
			return (Math.atan2(angy, angx) * 180) / Math.PI
		}
		el.addEventListener('touchstart', touchStart, { passive: false })
		el.addEventListener('touchmove', touchMove, { passive: false })
		el.addEventListener('touchend', touchEnd, { passive: false })
		// 在unbind钩子函数中移除事件监听器
		;(el as any).unbindSwipeDown = function () {
			el.removeEventListener('touchstart', touchStart)
			el.removeEventListener('touchmove', touchMove)
			el.removeEventListener('touchend', touchEnd)
		}
	},

	updated(el, binding) {},

	unmounted(el: any) {
		// 移除事件监听器
		if (el.unbindSwipeDown) {
			el.unbindSwipeDown()
			delete el.unbindSwipeDown
		}
	}
}
