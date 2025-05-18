import { defineNuxtPlugin } from '#app'
import { defineComponent, ref, h, render, createVNode, type ComponentInstance, type ComponentInternalInstance } from 'vue';
import { usePushStore } from "@/store/push";
import Push from '~/components/app/Push.vue';

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
const pushHandle = function (this: ComponentInternalInstance, 
    comp: any,
    params = {},
    direction = "rtl",
    size = "100%"
) {
    // 执行目标willDisappear方法
    let instance = this
    console.log('当前push的持有者',instance)
    if(instance?.willDisappear) instance.willDisappear()
    while (instance?.parent) {
        instance = instance.parent
        if(instance?.willDisappear) instance.willDisappear()
    }
    
    const pushStore = usePushStore();
    pushStore.setPushState(true);
    // 保存当前的 this 上下文
    const context = this;
    let dynamicComponent = {
        url: null,
        component: comp?.default || comp,
    };
    // if (typeof comp === "string") {
    //     // 加载路由对应的组件
    //     const routes = this.$router.options.routes;
    //     const { route, params: pas = {} } = findRoute(comp, routes);
    //     if (!route) return;
    //     if (route) dynamicComponent.component = route.component;
    //     params = Object.assign(params, pas);
    // }

    // const instance = getCurrentInstance(); // 获取当前 Vue 组件实例

    // 加载 push 组件
    // 创建 push 组件实例
    // 创建 push 组件的虚拟节点
    const props = {
        to: dynamicComponent.component,  // 传递给 Push 组件的动态目标组件
        url: dynamicComponent.url,       // 传递 URL 参数
        params: params || [],           // 传递额外的参数
        parent: context,                // 传递父组件或上下文
        direction: direction,           // 传递方向
        size: size,                     // 传递大小
        // parent:instance?.proxy
    }
    const pushInstance = createVNode(Push, props);
    // 手动提供 Nuxt 上下文
    const nuxtApp = useNuxtApp(); // 获取 Nuxt 上下文
    pushInstance.appContext = nuxtApp.vueApp._context;

    console.log("pushInstance", pushInstance, props);
    // 挂载 push 组件到目标元素中
    // pushInstance.$mount();
    // 在某个目标 DOM 元素中挂载组件
    render(pushInstance, document.body);

    // 查找上一层，实现轻微退出动画
    nextTick(() => {
        console.log("pushInstance", pushInstance);
        if (direction == "rtl") {
            // pushInstance.el.style.transform = "translateX(100vw)";
            setTimeout(() => {
                // pushInstance.el.style.transform = "translateX(0)";
                // const parentDrawer =
                //     context.$el.closest(".el-drawer__wrapper") ||
                //     document.querySelector("#__nuxt");
                // if (parentDrawer && !parentDrawer.classList.contains("pushup")) {
                //     parentDrawer.style.transform = "translateX(-30%)";
                //     // parentDrawer.classList.add("pop-right");
                // }
            }, 50);
        }
    })

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
function push(this: any,comp: any, params = {}, size = "100%") {
    return pushHandle.bind(this)(comp, params, "rtl", size);
}
function pushLeft(this: any,comp: any, params = {}, size = "100%") {
    return pushHandle.bind(this)(comp, params, "ltr", size);
}

// 底部弹出
function pushUp(this: any,comp: any, params = {}, size = "100%") {
    return pushHandle.bind(this)(comp, params, "btt", size);
}
function pushDown(this: any,comp: any, params = {}, size = "100%") {
    return pushHandle.bind(this)(comp, params, "ttb", size);
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
    nuxtApp.provide('push', push);
    nuxtApp.provide('pushLeft', pushLeft);
    nuxtApp.provide('pushUp', pushUp);
    nuxtApp.provide('pushDown', pushDown);
    nuxtApp.provide('popRoot', popRoot);
    nuxtApp.provide('pop', pop);

    console.log('push 注入。。。')
});
