const isDevMode = import.meta.env.MODE == "development";
// 定义一个接口来描述参数结构
interface MicroAppConfig {
    name: string; // 假设name是一个字符串
    entry: string; // 假设entry也是一个字符串
    container:string; // container可能是DOM节点或选择器字符串
    activeRule: string; // activeRule是一个函数
}
function createMicroApp(config: MicroAppConfig) {
    const { name, entry, container, activeRule } = config;
  return {
    microIns: null as any,
    name,
    entry, // 入口地址
    container,
    activeRule,
    props: {
      activeRule, // 传递给子应用的识别路由前缀
    },
  };
}

export async function setPrefetchBundleJson(app:any) {
  const t = new Date().getTime();
  fetch(app.entry + "?v=" + t);
  try {
    const res = await fetch(app.entry + "assets/bundle.json?v=" + t);
    const content = await res.text();
    const { manifest } = JSON.parse(content);
    manifest.forEach((url:string) => {
      prefetchScript([app.entry, url]);
    });
  } catch (e) {}
}

export function prefetchScript(urls:string[]) {
  let cbUrl = urls
    .map((u) => {
      if (u.startsWith("/")) {
        u = u.substring(1);
      }
      if (u.endsWith("/")) {
        u = u.substring(0, u.length - 1);
      }
      return u;
    })
    .join("/");
  if (!/^http/.test(cbUrl)) {
    cbUrl = "/" + cbUrl;
  }
  const dom = document.createElement("link");
  dom.setAttribute("href", cbUrl);
  dom.setAttribute("rel", "prefetch");
  document.body.append(dom);
  dom.onload = () => {
    dom.parentElement?.removeChild(dom);
  };
}

export const microApps = [
  createMicroApp({
    name: "wikitrade", // 很多文章说name是子应用的package.json中的name，其实试了这里没有任何关系，任意都行
    entry: isDevMode ? "http://127.0.0.1:5500/" : "/wikitrade/", // 开发模式要写完整url地址，生产上可以用nginx转发
    container: "#qiankun-content",
    activeRule: "/wikitrade",
  }),
];

export function cleanMicroApps() {
  microApps.forEach((app) => {
    if (app.microIns) {
      app.microIns.unmount();
      app.microIns = null;
    }
  });
}
