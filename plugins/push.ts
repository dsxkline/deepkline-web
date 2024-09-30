import { defineNuxtPlugin } from '#app'
import { usePushStore } from "@/store/push";

function findRoute(path: string, routes: any) {
    try {
        // console.log(routes);
        for (const route of routes) {
            const regex = new RegExp(`^${route.path.replace(/:\w+/g, "(\\w+)")}$`);
            const match = path.match(regex);
            if (match || route.name === path) {
                const keys = (route.path.match(/:\w+/g) || []).map((key: string) =>
                    key.substring(1)
                );
                const params: Record<string, string> = {};
                keys.forEach((key: string, index: number) => {
                    params[key] = match ? match[index + 1] : '';
                });
                return {
                    route,
                    params,
                };
            }
        }
    } catch (e) {
        console.log(e);
    }

    return {};
}
const pushHandle = async function (this: any,
    comp: any,
    params = {},
    direction = "rtl",
    size = "100%"
) {
    const pushStore = usePushStore();
    pushStore.setPushState(true);
    // 保存当前的 this 上下文
    const context = this as any;
    let dynamicComponent = {
        url: null,
        component: () => comp?.default || comp,
    };
    if (typeof comp === "string") {
        // 加载路由对应的组件
        const routes = this.$router.options.routes;
        const { route, params: pas = {} } = findRoute(comp, routes);
        if (!route) return;
        if (route) dynamicComponent.component = route.component;
        params = Object.assign(params, pas);
    }

    // 加载 push 组件
    const pushComponent = require("@/components/app/Push.vue").default;
    if (!pushComponent) return;
    // 创建 push 组件实例
    const pushInstance = defineComponent({
        setup() {
            const visible = ref(true);
            return () => h(pushComponent, {
                to: dynamicComponent.component,
                url: dynamicComponent.url,
                visible: visible.value,
                $params: params || [],
                parent: context,
                direction: direction,
                size,
            });
        }
    });

    // 挂载 push 组件到目标元素中
    pushInstance.$mount();
    //console.log("pushInstance", pushInstance);

    // 查找上一层，实现轻微退出动画
    if (direction == "rtl") {
        pushInstance.$el.style.transform = "translateX(100vw)";
        setTimeout(() => {
            pushInstance.$el.style.transform = "translateX(0)";
            const parentDrawer =
                context.$el.closest(".el-drawer__wrapper") ||
                document.querySelector("#__nuxt");
            if (parentDrawer && !parentDrawer.classList.contains("pushup")) {
                parentDrawer.style.transform = "translateX(-30%)";
                // parentDrawer.classList.add("pop-right");
            }
        }, 50);
    }

    return pushInstance;
};

const pop = function (data = {}) {
    const store = usePushStore();
    let topPush = store.getTopPush();
    // 需要查找最顶部的push回传数据
    if (topPush) {
        // 回传数据
        topPush.popData = data;
        if (!topPush.$el?.closest('.pushup')) {
            topPush.$el.style.transform = "translateX(100vw)";
        }
    } else {
        // 顶层

    }
    store.pop()
    // 父层抽屉恢复
    topPush = store.getTopPush();
    // console.log('pop',topPush)
    if (topPush) {
        const parentDrawer = topPush.$el.closest(".el-drawer__wrapper");
        if (parentDrawer && parentDrawer instanceof HTMLElement) {
            parentDrawer.style.transform = "translateX(0)";
        }
    } else {
        // 顶层
        const nuxt = document.querySelector("#__nuxt");
        if (nuxt && nuxt instanceof HTMLElement) {
            nuxt.style.transform = "translateX(0)";
        }
    }
};

// 右侧弹出
function push(comp: any, params = {}, direction = "rtl", size = "100%") {
    return pushHandle(comp, params, direction, size);
}
// 底部弹出
function pushUp(comp: any, params = {}, size = "100%") {
    return pushHandle(comp, params, "btt", size);
}
// 返回根视图
const popRoot = function (data: any, index = 0) {
    const pushComopnents = usePushStore().pushComopnents;
    const length = pushComopnents.length;
    // console.log("popRoot >>>", pushComopnents, index);
    if (length <= 1) return pop(data);
    // index 传负数表示从后往前，index = -1 表示返回倒数第二个，index = -2表示返回倒数第三个，因为倒数第一个是自己也就是index=0
    if (index < 0) {
        for (let i = length - 1; i >= length + index; i--) pop(data);
        return;
    }
    for (let i = length - 1; i >= index; i--) pop(data);
};


export default defineNuxtPlugin(({ vueApp }) => {
    const nuxtApp = useNuxtApp()
    nuxtApp.vueApp.provide('push', push);
    nuxtApp.vueApp.provide('pushUp', pushUp);
    nuxtApp.vueApp.provide('popRoot', popRoot);
    nuxtApp.vueApp.provide('pop', pop);
});
