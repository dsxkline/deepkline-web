// directives/v-autosize.ts
import type { Directive } from 'vue'

export const vAutosize: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    const defaultSize = binding.value || parseFloat(window.getComputedStyle(el).fontSize) || 16

    const resizeFont = () => {
      const parent = el.parentElement
      if (!parent) return

      // 获取父容器的 padding 值
      const style = window.getComputedStyle(parent)
      const paddingLeft = parseFloat(style.paddingLeft) || 0
      const paddingRight = parseFloat(style.paddingRight) || 0

      // 去除 padding 后的有效宽度
      const contentWidth = parent.clientWidth - paddingLeft - paddingRight

      el.style.fontSize = `${defaultSize}px`
      el.style.whiteSpace = 'nowrap'
      el.style.display = 'inline-block'

      const scale = contentWidth / el.scrollWidth

      if (scale < 1) {
        el.style.fontSize = `${defaultSize * scale}px`
      } else {
        el.style.fontSize = `${defaultSize}px`
      }
    }

    resizeFont()

    console.log('resizefont',el.style.fontSize)
    // const observer = new ResizeObserver(resizeFont)
    // observer.observe(el);
    // (el as any).__autosizeObserver = observer
  },

  updated(el, binding) {
    // 如果父元素大小或内容改变，需要重新计算
    // const defaultSize = binding.value || 16
    // el.style.fontSize = `${defaultSize}px`
    // const resizeFont = () => {
    //   const parent = el.parentElement
    //   if (!parent) return
    //   const scale = parent.clientWidth / el.scrollWidth
    //   el.style.fontSize = `${defaultSize * Math.min(scale, 1)}px`
    // }
    // resizeFont()
  },

  unmounted(el) {
    // const observer = (el as any).__autosizeObserver
    // if (observer) {
    //   observer.disconnect()
    //   delete (el as any).__autosizeObserver
    // }
  },
}
