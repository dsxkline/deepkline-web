<script setup lang="ts">
import { usePushStore } from '~/store/push';
import type { DrawerProps } from 'element-plus'
import { getCurrentInstance, render } from 'vue'
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
            if (container) {
                render(null,container);
                // container.removeChild(instance.vnode.el);  // 从 DOM 中移除组件
                console.log('Component unmounted!', container, instance.vnode.el, instance);
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
    }
});
// 动态导入组件
const asyncComponent = computed(() => {
    if (props.to) {
        // 动态导入组件，假设 `to` 是组件的名称或路径
        return props.to
    }
    return null;
});

// 把参数通过props传递给目标组件
const componentProps = computed(() => (props.params))

const swipeDown = () => {

};

onBeforeUnmount(() => {
    // 获取组件的父级
    // if (instance) {
    //     let parent = instance.parent;
    //     while (parent) {
    //         // pop的时候返回执行自定义poped方法
    //         // console.log("parent///test", parent, this.popData);
    //         if (parent.exposed?.poped && instance.exposed?.popData) {
    //             parent.exposed?.poped(instance.exposed?.popData);
    //             break;
    //         }
    //         parent = parent.parent;
    //     }
    // }
    console.log('onBeforeUnmount')
    setTimeout(() => {
        usePushStore().setPushState(false);
    }, 100);
})

onMounted(() => {
    console.log('push mounted...', props.size, instance)
    usePushStore().push(instance)
})

</script>

<template>
    <div>
        <el-drawer v-model="visibleDrawer" :direction="direction" :destroy-on-close="true"
            :modal="true" :size="drawerSize" @closed="closed" ref="drawer"
            :class="{ pushup: direction == 'btt' && size != '100%' }"
        >
            <template #default>
                <div class="drawer_body" ref="drawerBody">
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
    </div>
</template>