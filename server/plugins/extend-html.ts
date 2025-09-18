export default defineNitroPlugin(nitroApp => {
	nitroApp.hooks.hook('render:html', async (html, { event }) => {
		// 这将是 HTML 模板的对象表示形式。
		// console.log(html.head)
		// html.head.push(`<meta name="description" content="My custom description" />`)
		// const storage = useStorage()
		// console.log("nuxt-color-mode",await storage.getItem('nuxt-color-mode'));

    

		html.bodyAppend.push(
			`<div class="startup-container bg-base fixed top-0 left-0 w-full h-full z-[99999] transition-all flex items-center justify-center">
        <div class="face-container w-full h-auto flex items-center justify-center mt-[-100px]">
            <div class="face-content flex items-center justify-center flex-col p-4">
                <div class="face-icon flex items-center justify-center relative overflow-hidden rounded-xl">
                    <img src="./images/pwa/logo192.png" alt="Face Icon" class="w-16 h-16" />
                    <div class="progress-bar"></div>
                </div>
                <div class="face-text mt-4 text-center text-main text-lg font-semibold">DeepKline</div>
                <div class="face-button mt-1 text-muted text-sm min-h-5"></div>
            </div>
        </div>
	    </div>
      <style>
      .light .startup-container {
        &::before {
          background-image: unset;
        }
      }
      .startup-container {
        &::before {
          background-image: var(--bg-linear-180);
          // filter: blur(60px);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          content: '';
          z-index: -1;
          opacity: 0.15;
        }
      }
      .progress-bar {
        position: absolute;
        animation: shine 1.5s ease-in-out 0s;
        top: 0;
        width: 200%;
        height: 300%;
        content: '';
        background: linear-gradient(to right, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%);
        transform: skewX(-45deg);
        animation-iteration-count: infinite;
      }

      @keyframes shine {
        0% {
          left: -200%;
                top: -200%;
        }
        100% {
          left: 150%;
                top: 120%;
        }
      }
      </style>
      `
		)
	})
	// 你也可以在这里拦截响应。
	// nitroApp.hooks.hook('render:response', (response, { event }) => {
	//   console.log(response)
	// })
	// nitroApp.hooks.hook('render:island', (islandResponse, { event, islandContext }) => {
	//   console.log(islandResponse)
	// })
})
