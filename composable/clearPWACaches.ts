export default function clearPWACaches(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        resolve(event.data?.success ?? false)
      }

      navigator.serviceWorker.controller.postMessage(
        { action: 'clearAllCaches' },
        [channel.port2]
      )
    } else {
      console.warn('[SW] 当前无可用 Service Worker')
      resolve(false)
    }
  })
}
