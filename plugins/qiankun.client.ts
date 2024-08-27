import { prefetchApps, registerMicroApps, start, loadMicroApp } from "qiankun";
import { debounce } from "lodash-es";
import { microApps, setPrefetchBundleJson } from "@/store/qiankun";

// const registerApps = () => {
//   registerMicroApps(microApps, {
//     beforeLoad: (a, b, c) => {
//       console.log(a, b, c);
//       console.log("加载前");
//     },
//     beforeMount: (a, b, c) => {
//       console.log(a, b, c);
//       console.log("挂载前");
//     },
//     afterMount: (a, b, c) => {
//       console.log(a, b, c);
//       console.log("挂载后");
//     },
//     beforeUnmount: (a, b, c) => {
//       console.log(a, b, c);
//       console.log("销毁前");
//     },
//     afterUnmount: (a, b, c) => {
//       console.log(a, b, c);
//       console.log("销毁后");
//     },
//   });
//   /**
//    * 方式一：采用qiankun自带的预请求，但是效果不好，因为子应用的很多js和css文件不会预先请求到
//    */
//   // start({
//   //   prefetch: "all", // 预加载
//   //   sandbox: {
//   //     // experimentalStyleIsolation: true, // 添加顶部样式选择器 css scoped 样式隔离
//   //     strictStyleIsolation: true, // 开启 shadowDOM css scoped 样式隔离
//   //   },
//   // });
//   /**
//    * 方式二：手动预请求子应用js和css文件，子应用生成一个manifest.json文件，里面包含子应用所有js和css，自己做文件预请求缓存
//    */
//   microApps.forEach((app) => {
//     setPrefetchBundleJson(app);
//   });
// };

export default defineNuxtPlugin((nuxtApp) => {
  // registerApps();
  const router = useRouter();
  nuxtApp.vueApp.mixin({
    mounted: () => {
      watch(
        () => router.currentRoute.value.path,
        (toPath) => {
          const microItem = microApps.find((it) =>
            toPath.startsWith(it.activeRule)
          );
          if (microItem && !microItem.microIns) {
            const domContainer = document.querySelector(microItem.container);
            if (domContainer) {
              microItem.microIns = loadMicroApp(microItem);
            }
          }
        },
        { immediate: true, deep: true }
      );
    },
  });
  // 手动预请求子应用js和css文件
  microApps.forEach((app) => {
    setPrefetchBundleJson(app);
  });
});
