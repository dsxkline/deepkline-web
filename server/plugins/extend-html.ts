export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:html', async (html, { event }) => { 
      // 这将是 HTML 模板的对象表示形式。
      // console.log(html.head)
      // html.head.push(`<meta name="description" content="My custom description" />`)
      // const storage = useStorage()
      // console.log("nuxt-color-mode",await storage.getItem('nuxt-color-mode'));
    })
    // 你也可以在这里拦截响应。
    // nitroApp.hooks.hook('render:response', (response, { event }) => { 
    //   console.log(response) 
    // })
    // nitroApp.hooks.hook('render:island', (islandResponse, { event, islandContext }) => { 
    //   console.log(islandResponse) 
    // })
  })
  