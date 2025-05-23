<script setup lang="ts">
import { usePushStore } from '~/store/push';
import type { DrawerProps } from 'element-plus'
import { getCurrentInstance, render, type ComponentInternalInstance } from 'vue'
// import SymbolSearch from '../symbol/SymbolSearch.vue';
const instance = getCurrentInstance()
const props = defineProps<{
    visible?: boolean;
    direction?: DrawerProps['direction'];
    size?: string;
    asyncComponent?: Component;
    url?: string;
    to?: any;
    params?: any;
    popData?: any;
    parent:ComponentInternalInstance
}>();
const drawerSize = ref(props.size);
const drawer = ref(null);
const show = ref(true)
const hide = () => {
    if (drawer.value) {
        (drawer.value as any).hide();
    }
};
const close = () => {
    hide();
};
const closed = () => {
    // 调用组件卸载方法
    if (instance) {
        nextTick(() => {
            const container = instance?.vnode.el?.parentNode;
            // console.log('Component unmounted! container', container, instance.vnode.el, instance);
            if (container) {
                render(null,container);
                document.body.removeChild(container);  // 从 DOM 中移除组件
                // console.log('Component unmounted!', container, instance.vnode.el, instance);
                show.value = false;
            }
        });
    }
};

// 是否显示
const visibleDrawer = computed({
    get: () => {
        const vs = usePushStore().getPushComponent(instance) >= 0 ? true : false;
        console.log('visibleDrawer', vs)
        return vs;
    }, set: (val) => {
        console.log('visibleDrawer', val);
        if(!val) usePushStore().pop()
    }
});

// 异步加载组件
const asyncComponent = computed(() => props.to)


// 把参数通过props传递给目标组件
const componentProps = computed(() => (props.params))

const swipeDown = () => {

};

onUnmounted(() => {
    // 获取组件的父级
    if (props.parent) {
        let parent:ComponentInternalInstance | null = props.parent;
        while (parent) {
            // pop的时候返回执行自定义poped方法
            // console.log("parent///test", parent, this.popData);
            if (parent?.poped) {
                parent?.poped(props.popData);
                break;
            }
            parent = parent.parent;
        }
        parent = props.parent;
        while (parent) {
            // pop的时候返回执行自定义poped方法
            // console.log("parent///test", parent);
            if (parent?.willAppear) {
                parent?.willAppear(props.popData);
            }
            parent = parent.parent;
        }
    }
    drawer.value = null
    console.log('onBeforeUnmount')
    setTimeout(() => {
        usePushStore().setPushState(false);
    }, 100);

    console.log('getCurrentInstance()?.parent',getCurrentInstance()?.parent)
})

onMounted(() => {
    console.log('push mounted...', props.size, instance)
    usePushStore().push(instance)
})

</script>

<template>
 
        <el-drawer v-model="visibleDrawer" :direction="direction" :destroy-on-close="true"
            :modal="true" :size="drawerSize" @closed="closed" ref="drawer"
            :class="{ pushup: direction == 'btt' && size != '100%' }"
            :with-header="false"
            :append-to-body="true"
        >
            <template #default>
                <div class="drawer_body w-full">
                    <!-- <SafeArea></SafeArea>
                    <template v-if="direction == 'btt' && size != '100%'">
                        <DrawLine @click="hide" />
                        <div class="close" @click="hide" v-if="!params?.hideClose">
                            <Close />
                        </div>
                    </template> -->
                    <component :is="to" :push="true" @close="close" v-bind="componentProps" />
                    <!-- <WebView :url="url" v-if="!to && url"></WebView> -->
                </div>
            </template>
        </el-drawer>
 
</template>