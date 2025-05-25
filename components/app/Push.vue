<script setup lang="ts">
	import { usePushStore } from '~/store/push'
	import type { DrawerProps } from 'element-plus'
	import { getCurrentInstance, render, type ComponentInternalInstance } from 'vue'
	// import SymbolSearch from '../symbol/SymbolSearch.vue';
	const instance = getCurrentInstance()
	const props = defineProps<{
		visible?: boolean
		direction?: DrawerProps['direction']
		size?: string
		asyncComponent?: Component
		url?: string
		to?: any
		params?: any
		popData?: any
		parent: ComponentInternalInstance
	}>()
	const drawerSize = ref(props.size)
	const drawer = ref<HTMLElement|null>(null)
	const show = ref(true)
	const hide = () => {
		visibleDrawer.value = false;
	}
	const close = () => {
		hide()
	}
	const closed = () => {
		// 调用组件卸载方法
		if (instance) {
			nextTick(() => {
				const container = instance?.vnode.el?.parentNode
				// console.log('Component unmounted! container', container, instance.vnode.el, instance);
				if (container) {
					render(null, container)
					document.body.removeChild(container) // 从 DOM 中移除组件
					// console.log('Component unmounted!', container, instance.vnode.el, instance);
					show.value = false
				}
			})
		}
	}

	// 是否显示
	const visibleDrawer = computed({
		get: () => {
			const vs = usePushStore().getPushComponent(instance) >= 0 ? true : false
			console.log('visibleDrawer', vs)
			return vs
		},
		set: val => {
			const vs = usePushStore().getPushComponent(instance) >= 0 ? true : false
			console.log('visibleDrawer set', val, vs)
			if (!val && vs) usePushStore().pop()
		}
	})

	// 异步加载组件
	const asyncComponent = computed(() => props.to)

	// 把参数通过props传递给目标组件
	const componentProps = computed(() => props.params)

    let contentHeight = 0
	const swipeDown = (distance:number,time:number,end:boolean) => {
        console.log('swipedown....',distance,time,end)
        if(!drawer.value) return;
        // 跟着滑下来
        const content = drawer.value.querySelector('.el-drawer.btt') as HTMLElement
        if (content) {
            if (!contentHeight && content.clientHeight > 0) contentHeight = content.clientHeight
            content.style.transition = 'unset'
            content.style.height = contentHeight - distance + 'px'
            // 下拉关闭
            drawerSize.value = content.style.height
            if (end) {
                content.style.transition = 'all var(--el-transition-duration)'
                if ((distance > contentHeight / 2 && time > 0) || (distance > 70 && time < 200 && time > 0)) {
                    // 关闭
                    hide()
                } else {
                    // 恢复原始高度
                    content.style.height = props.size||''
                    drawerSize.value = props.size
                }
            }
        }
    }

	onUnmounted(() => {
		// 获取组件的父级
		if (props.parent) {
			let parent: ComponentInternalInstance | null = props.parent
			while (parent) {
				// pop的时候返回执行自定义poped方法
				// console.log("parent///test", parent, this.popData);
				if (parent?.poped) {
					parent?.poped(props.popData)
					break
				}
				parent = parent.parent
			}
			parent = props.parent
			while (parent) {
				// pop的时候返回执行自定义poped方法
				// console.log("parent///test", parent);
				if (parent?.willAppear) {
					parent?.willAppear(props.popData)
				}
				parent = parent.parent
			}
		}
		drawer.value = null
		console.log('onBeforeUnmount')
		setTimeout(() => {
			usePushStore().setPushState(false)
		}, 100)

		console.log('getCurrentInstance()?.parent', getCurrentInstance()?.parent)
	})

	onMounted(() => {
		console.log('push mounted...', props.size, instance, drawer.value)
		usePushStore().push(instance)
	})

	function getInstance() {
		return drawer.value
	}

	defineExpose({
		getInstance
	})
</script>

<template>
	<div class="drawer-container" ref="drawer">
		<el-drawer
			v-model="visibleDrawer"
			:direction="direction"
			:destroy-on-close="true"
			:modal="true"
			:size="drawerSize"
			@closed="closed"
			:class="{ pushup: direction == 'btt' && size != '100%' }"
			:with-header="false"
              
		>
			<template #default>
				<div class="drawer_body w-full h-full flex flex-col relative" v-swipe-down="direction == 'btt' && size != '100%'?swipeDown:null">
                    <template v-if="direction == 'btt' && size != '100%'">
                        <div @click="hide"><DrawLine /></div>
                    </template>
					<component :is="to" :push="true" @close="close" v-bind="componentProps" />
					<!-- <WebView :url="url" v-if="!to && url"></WebView> -->
				</div>
			</template>
		</el-drawer>
	</div>
</template>
