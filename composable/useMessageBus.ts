// ~/utils/messageBus.ts
type MessagePayload = {
  type: string
  data?: any
}

type Callback = (data: any) => void

const listeners = new Map<string, Set<Callback>>()

// 派发消息
export const postMessage = (type: string, data?: any) => {
  const payload: MessagePayload = { type, data }
  window.postMessage(payload, '*')
}

// 订阅消息
export const onMessage = (type: string, callback: Callback) => {
  if (!listeners.has(type)) {
    listeners.set(type, new Set())
  }
  listeners.get(type)!.add(callback)
}

// 取消订阅
export const offMessage = (type: string, callback: Callback) => {
  listeners.get(type)?.delete(callback)
}

// 初始化 window.message 监听器（只注册一次）
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    const { type, data } = event.data || {}
    if (!type) return
    listeners.get(type)?.forEach((cb) => cb(data))
  })
}
