<script setup lang="ts">
import { usePushStore } from '~/store/push';
import type { DrawerProps } from 'element-plus'
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
const props = defineProps<{
    visible: boolean;
    direction: DrawerProps['direction'];
    size: string;
    asyncComponent: Component;
    url: string;
    to: string;
    $params: any;
    popData: any;
}>();
const drawerSize = ref(props.size);
const drawer = ref(null);
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
   
};

// 是否显示
const visibleDrawer = computed(() => {
    const vs = usePushStore().getPushComponent(this as any) ? true : false;
    return vs;
});
// 动态导入组件
const asyncComponent = computed(() => {
    if (props.to) {
        // 动态导入组件，假设 `to` 是组件的名称或路径
        return async () =>
            new Promise((resolve) => {
                const view = props.to;
                // view.props = componentProps.value;
                return resolve(view);
            });
    }
    return null;
});

// 把参数通过props传递给目标组件
const componentProps = computed(() => (props.$params))

const swipeDown = () => {
 
};

onBeforeUnmount(() => {
    // 获取组件的父级
    if (instance) {
        let parent = instance.parent;
        while (parent) {
            // pop的时候返回执行自定义poped方法
            // console.log("parent///test", parent, this.popData);
            if (parent.exposed?.poped && instance.exposed?.popData) {
                parent.exposed?.poped(instance.exposed?.popData);
                break;
            }
            parent = parent.parent;
        }
    }
    setTimeout(() => {
        usePushStore().setPushState(false);
    }, 100);
})
</script>

<template>
    <el-drawer :visible.sync="visibleDrawer" :direction="direction" :withHeader="false" :modal-append-to-body="false"
        :append-to-body="true" :modal="direction == 'btt' && size != '100%'"
        :wrapperClosable="$params.wrapperClosable == undefined ? true : $params.wrapperClosable" :size="drawerSize"
        @closed="closed" ref="drawer" :class="{ pushup: direction == 'btt' && size != '100%' }"
        v-swipe-down="direction == 'btt' && size != '100%' ? swipeDown : null">
        <div class="drawer_body" ref="drawerBody">
            <SafeArea></SafeArea>
            <template v-if="direction == 'btt' && size != '100%'">
                <DrawLine @click="hide" />
                <div class="close" @click="hide" v-if="!$params.hideClose">
                    <Close />
                </div>
            </template>
            <component :is="asyncComponent"  v-if="to && !url" :push="true" @close="close" v-bind="componentProps" />
            <WebView :url="url" v-if="!to && url"></WebView>
        </div>
    </el-drawer>
</template>