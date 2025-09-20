<template>
	<div class="up-loading" ref="upLoading" :style="{ height: height + 'px' }">
		<div class="up-loading-content" ref="upLoadingContent">
			<div class="up-loading-text">
				<span class="icon" v-show="status === 'loading' || status === 'show'">
					<div class="loading-page">
						<div class="loading" ref="loading"></div>
					</div>
				</span>
				<span class="text-grey text-ms" v-if="status === 'hide' && hideText && !isTheend">{{ hideText }}</span>
				<span class="text-grey text-ms" v-if="status === 'show' && showText && !isTheend">{{ showText }}</span>
				<span class="text-grey text-ms" v-if="status === 'success' && hideText">{{ hideText }}</span>
				<span class="text-grey text-ms" v-if="(status === 'end' || isTheend) && (endText || statusText)">{{ endText || statusText }}</span>
				<span class="text-grey text-ms px-1" v-if="status === 'loading' && loadingText && !isTheend">{{ loadingText }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.up-loading {
		width: 100%;
		overflow: hidden;
		.up-loading-content {
			// transform: translateY(-100%);
			padding: 16px;
			width: calc(100% - 0);
			height: calc(100% - 0);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: row;
			.up-loading-text {
				display: flex;
				align-items: center;
				justify-content: center;
				.text {
					padding: 0 5px;
				}
				.icon {
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.loading-page {
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.loading {
					display: inline-block;
					width: 20px;
					height: 20px;
					border: 2px solid var(--transparent10);
					border-radius: 50%;
					border-top-color: rgb(var(--text-color-grey));
				}
			}
		}
	}
</style>

<script>
	export default {
		props: {
			loading: {
				type: Boolean,
				default: false
			},
			height: {
				type: Number,
				default: 80
			},
			hideText: {
				type: String,
				default: '' //上拉加载更多
			},
			showText: {
				type: String,
				default: '' //松开加载更多
			},
			loadingText: {
				type: String,
				default: '' //加载中...
			},
			endText: {
				type: String,
				default: '' //到底了...
			},
			startLoading: {
				type: Function,
				default: null
			}
		},
		data() {
			return {
				scroll: null,
				scrollHandler: null,
				touchY: 0,
				deltaY: 0,
				scrollTop: 0,
				touchStartHandler: false,
				touchMoveHandler: false,
				touchEndHandler: false,
				status: 'hide', // hide=隐藏 show=显示 loading=正在加载状态
				process: 0, // 上拉进度
				touching: false,
				statusText: '',
				isTheend: false
			}
		},
		methods: {
			loadingAnimation() {
				if (this.status != 'loading' || !this.$refs.loading?.style) return
				// 旋转动画
				this.$refs.loading.style.transform = `rotate(${this.process * 360}deg)`
				this.process += (1 / 100) * 3
				requestAnimationFrame(this.loadingAnimation.bind(this))
			},
			reset(status) {
				this.deltaY = 0
				this.$nextTick(() => {
					if (!this.$refs.upLoading) return
					//this.$refs.upLoading.style.transition = 'all 0.2s'
					// this.$refs.upLoading.style.height = `0px`
					//this.$refs.upLoadingContent.style.transition = 'all 0.2s'
					//this.$refs.upLoadingContent.style.transform = `translateY(100%)`
					//this.$refs.upLoading.style.transform = `translateY(0)`
					setTimeout(() => {
						this.status = status
						this.touching = false
					}, 300)
				})
			},
			setHeight(h) {
				if (!this.$refs.upLoading) return
				h = Math.abs(h)
				this.$refs.upLoading.style.transition = 'none'
				this.$refs.upLoadingContent.style.transition = 'none'
				const bottom = Math.max(this.height - h, 0)
				// this.$refs.upLoading.style.height = `${Math.min(h, this.height)}px`
				//this.$refs.upLoadingContent.style.transform = `translateY(${bottom / this.height * 100}%)`
				// this.process = Math.min(h / this.height, 1)
				this.process += 1 / 100
				this.$refs.loading.style.transform = `rotate(${this.process * 360}deg)`
				if (h >= this.height) {
					this.status = 'show'
				}
				//console.log('upLoading process', this.process, h, this.height)
			},
			observeScroll() {
				// 默认是监听父级
				this.scroll = this.$el.parentElement
				this.scroll.style.position = 'relative'
				this.scrollHandler = this.scrollEventHandler.bind(this)
				this.scroll.addEventListener('scroll', this.scrollHandler)
				this.touchMoveHandler = this.touchMoveEventHandler.bind(this)
				this.touchStartHandler = this.touchStartEventHandler.bind(this)
				this.touchEndHandler = this.touchEndEventHandler.bind(this)
				this.scroll.addEventListener('touchmove', this.touchMoveHandler)
				this.scroll.addEventListener('touchstart', this.touchStartHandler)
				this.scroll.addEventListener('touchend', this.touchEndHandler)
			},
			scrollEventHandler() {
				if (this.isTheend) return
				this.scrollTop = this.scroll.scrollTop
				const scrollTop = this.scroll.scrollTop
				const scrollHeight = this.scroll.scrollHeight
				const clientHeight = this.scroll.clientHeight
				if (this.touchY <= 0 && scrollTop + clientHeight + 1 >= scrollHeight && this.status != 'loading') {
					const h = Math.max(Math.abs(this.deltaY), scrollTop + clientHeight + 1)

					// 手指离开后，利用滚动惯性，继续加载
					if (this.startLoading && Math.abs(h) >= this.height && scrollTop + clientHeight + 1 >= scrollHeight) {
						this.setHeight(-Math.abs(this.height))
						// 正在加载状态
						this.status = 'loading'
						this.loadingAnimation()
						// console.log('startUpLoading')
						this.startLoading(this)
					} else {
						this.setHeight(-Math.abs(h))
					}
				}
			},
			touchMoveEventHandler(e) {
				if (this.isTheend) return
				const touchY = e.touches[0].clientY
				const deltaY = touchY - this.touchY
				this.deltaY = deltaY

				const scrollHeight = this.scroll.scrollHeight
				const clientHeight = this.scroll.clientHeight
				const scrollTop = this.scroll.scrollTop

				if (deltaY < 0 && scrollTop + clientHeight + this.height >= scrollHeight) {
					this.setHeight(deltaY)
					// this.scroll.scrollTop = this.touchScrollY+Math.abs(deltaY);
				}
			},
			touchStartEventHandler(e) {
				this.touching = true
				this.touchY = e.touches[0].clientY
				this.touchScrollY = this.scrollTop
			},
			touchEndEventHandler(e) {
				this.touchY = 0
				// console.log('touchEnd', e)
				this.setStopAndLoading()
			},
			setStopAndLoading() {
				// 如果组件有loading事件，则触发
				const scrollHeight = this.scroll.scrollHeight
				const clientHeight = this.scroll.clientHeight
				const scrollTop = this.scroll.scrollTop
				// console.log('scrollHeight', scrollHeight, 'clientHeight', clientHeight, 'scrollTop', scrollTop);
				if (this.startLoading && Math.abs(this.deltaY) >= this.height && scrollTop + clientHeight + 1 >= scrollHeight) {
					// 正在加载状态
					this.status = 'loading'
					this.loadingAnimation()
					// console.log('startUpLoading')
					this.startLoading(this)
				} else {
					this.reset('success')
				}
			},
			success() {
				//console.log('uploading success')
				setTimeout(() => {
					this.reset('success')
				}, 600)
			},
			error() {
				//console.log('uploading error')
				setTimeout(() => {
					this.reset('error')
				}, 600)
			},
			theend(text) {
				this.isTheend = true
				this.$emit('update:endText', text)
				this.statusText = text
				//console.log('theend text:', text, this.endText)
				setTimeout(() => {
					this.reset('end')
				}, 600)
			},
			restart(){
				this.isTheend = false
			}
		},
		mounted() {
			this.observeScroll()
			this.reset('show')
			// console.log('this', this)
		},
		beforeDestroy() {
			this.scroll.removeEventListener('scroll', this.scrollHandler)
			this.$el.removeEventListener('touchmove', this.touchMoveHandler)
			this.$el.removeEventListener('touchstart', this.touchStartHandler)
			this.$el.removeEventListener('touchend', this.touchEndHandler)
		}
	}
</script>
