<script setup lang="ts">
	import type { Component } from 'vue'

	export interface MenuModel {
		name: string
		icon?: Component
		iconSelected?: Component
		titleComp?: Component
		contentComp?: Component
		contentParams?: Record<any, any>
		onClick?: () => {}
	}
	const props = defineProps({
		menus: {
			type: Array as PropType<MenuModel[]>, // 指定数组类型
			default: () => []
		},
		active: {
			type: Number,
			default: () => 0
		},
		hideLine: {
			type: Boolean,
			default: false
		},
		height: {
			type: Number,
			default: 0
		},
		lineWidth: {
			type: Number,
			default: 6
		},
		autoLoad: {
			type: Boolean,
			default: true
		}
	})
	const menuActive = ref(0)
	const tabbarContent = ref()
	const bottomLine = ref()
	const tabbarHeader = ref()
	const isDestroyed = ref(false) // 是否已销毁
	interface ComponentWithUpdate {
		update?: () => void
		leave?: () => void
	}
	const componentRefs = ref<ComponentWithUpdate[]|null>([]) // 存储组件实例
	const emit = defineEmits<{
		(event: 'update:active', value: number): void
	}>()

	watch(
		() => menuActive.value,
		(n, o) => {
			// console.log('menuActive.value', n)
			emit('update:active', n)
		}
	)

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height - tabbarHeader.value?.clientHeight || 0
	})

	function menuHandler(item: MenuModel, index: number) {
		menuActive.value = index
		moveContent(index)
		if(!componentRefs.value) return;
		// 执行内容组件的更新方法 , 例如: this.$refs['tabbarContent-'+index].update()
		const content = componentRefs.value[index]
		// 判断组件是否暴露update方法
		if (content && content.update) {
			content.update()
		}
		// 其他组件执行离开方法
		componentRefs.value.forEach((item, i) => {
			if (i !== index && item.leave) {
				item.leave()
			}
		})
		// 执行点击事件
		if (item.onClick) {
			item.onClick()
			return
		}
	}

	function moveContent(index: number) {
		// 重置所有item的x轴偏移
		const translateX = -index * 100
		tabbarContent.value.style.transform = `translateX(${translateX}%)`
		// 横线移动
		nextTick(() => {
			const line = tabbarHeader.value.querySelector('.line')
			const li = tabbarHeader.value.querySelector('li.active')
			if (li && line) {
				const w = li.clientWidth
				if (props.lineWidth <= 0) line.style.width = w + 'px'
				else line.style.width = props.lineWidth + 'px'
				// 计算菜单的位置
				const offsetLeft = li.offsetLeft + (props.lineWidth > 0 ? (w - props.lineWidth) / 2 : 0)
				line.style.left = offsetLeft + 'px'
			}
		})
	}

	function update(index: number) {
		// 默认点击某个菜单
		const menu = props.menus[index]
		if (menu) menuHandler(menu, index)
	}

	function updateAll() {
		componentRefs.value && componentRefs.value.forEach(content => {
			// 判断组件是否暴露update方法
			if (content && content.update) {
				content.update()
			}
		})
	}

	onMounted(() => {
		menuActive.value = props.active
		nextTick(() => {
			props.autoLoad && update(menuActive.value)
		})
	})

	onBeforeUnmount(() => {
		// 子组件卸载
		if (componentRefs.value) {
			componentRefs.value.forEach(item => {
				if (item.leave) item.leave()
			})
		}
		isDestroyed.value = true
		// 清理引用
		tabbarContent.value = null
		bottomLine.value = null
		tabbarHeader.value = null
		
	})

	defineExpose({
		update,
		updateAll
	})
</script>

<template>
	<div class="tabbar-container flex overflow-hidden flex-col" :style="[height ? `height:${height}px` : 'auto']">
		<div class="tabbar-header px-4 w-full relative" ref="tabbarHeader">
			<ul class="flex py-1 w-max h-full text-base *:mx-2">
				<li v-for="(item, index) in menus" :key="index" v-click-sound @click="menuHandler(item, index)" :class="{ active: index == menuActive }">
					<template v-if="item.titleComp">
						<component :is="item.titleComp" />
					</template>
					<template v-else>
						<component v-if="item.icon" :is="item.icon" />
						<span>{{ item.name }}</span>
					</template>
				</li>
			</ul>
			<div class="line" ref="bottomLine" v-show="!hideLine"></div>
		</div>
		<div class="tabbar-content" ref="tabbarContent" :style="{ height: contentHeight ? `${contentHeight}px` : 'auto' }">
			<div class="tabbar-content-item" v-for="(item, index) in menus">
				<component :is="item.contentComp" v-bind="item.contentParams" ref="componentRefs" :height="contentHeight" v-if="!isDestroyed" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
	.tabbar-container {
		.tabbar-header {
			ul {
				li {
					cursor: pointer;
					color: rgb(var(--color-text-muted));
					user-select: none;
					display: flex;
					align-items: center;
					&:first-child {
						margin-left: 0;
					}
					&:last-child {
						margin-right: 0;
					}
					&:hover {
						color: rgb(var(--color-text-grey));
					}
					&.active {
						color: rgb(var(--color-text-main));
						font-weight: bold;
					}
				}
			}
			.line {
				position: absolute;
				height: 2px;
				background: rgb(var(--color-text-main));
				width: 0px;
				bottom: 0;
				transition: 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
			}
		}
		.tabbar-content {
			flex: 1;
			width: 100%;
			position: relative;
			display: flex;
			transform: translateX(0%);
			transition: 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
			.tabbar-content-item {
				width: 100%;
				flex: none;
			}
		}
	}
</style>
