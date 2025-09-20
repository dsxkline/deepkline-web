<template>
	<div class="down-loading" ref="downLoading">
		<div class="down-loading-content" ref="downLoadingContent">
			<div class="down-loading-text">
				<span class="icon">
					<div class="loading-page">
						<div class="loading" ref="loading"></div>
					</div>
				</span>
				<span class="text" v-if="status === 'hide' && !hideText">{{ hideText }}</span>
				<span class="text" v-if="status === 'show' && !showText">{{ showText }}</span>
				<span class="text" v-if="status === 'loading' && !loadingText">{{ loadingText }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.down-loading {
		width: 100%;
		overflow: hidden;
		.down-loading-content {
			transform: translateY(-100%);
			padding: 16px;
			width: calc(100%);
			height: calc(100%);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: row;
			.down-loading-text {
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
				default: 60
			},
			hideText: {
				type: String,
				default: '' //下拉加载更多
			},
			showText: {
				type: String,
				default: '' //松开加载更多
			},
			loadingText: {
				type: String,
				default: '' //加载中...
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
				process: 0 // 下拉进度
			}
		},
		methods: {
			loadingAnimation() {
				if (this.status != 'loading' || !this.$refs.loading) return
				// 旋转动画
				this.$refs.loading.style.transform = `rotate(${this.process * 360}deg)`
				this.process += (1 / 100) * 3
				requestAnimationFrame(this.loadingAnimation.bind(this))
			},
			reset() {
				this.deltaY = 0
				this.$nextTick(() => {
					if (!this.$refs.downLoading) return
					this.$refs.downLoading.style.transition = 'all 0.2s'
					this.$refs.downLoading.style.height = `0px`
					this.$refs.downLoadingContent.style.transition = 'all 0.2s'
					this.$refs.downLoadingContent.style.transform = `translateY(-100%)`
					this.$refs.downLoading.style.transform = `translateY(0)`
					this.status = 'hide'
				})
			},
			setHeight(h) {
				if (!this.$refs.downLoading) return
				this.$refs.downLoading.style.transition = 'none'
				this.$refs.downLoadingContent.style.transition = 'none'
				const top = -Math.max(this.height - h, 0)
				this.$refs.downLoading.style.height = `${Math.min(h, this.height)}px`
				this.$refs.downLoadingContent.style.transform = `translateY(${top}px)`
				this.process += 1 / 100
				this.$refs.loading.style.transform = `rotate(${this.process * 360}deg)`
				if (h >= this.height) {
					this.status = 'show'
				}
				// console.log('downLoading process', this.process)
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
				this.scrollTop = this.scroll.scrollTop
				// console.log('scroll',this.scrollTop)
				if (this.touchY <= 0 && this.scrollTop < 0 && this.status != 'loading') {
					// 手指离开后，利用滚动惯性，继续加载
					if (this.startLoading && Math.abs(this.scrollTop) >= this.height && this.scroll.scrollTop <= 0) {
						this.setHeight(this.height)
						// 正在加载状态
						this.status = 'loading'
						this.loadingAnimation()
						// console.log('startDownLoading')
						this.startLoading(this)
					} else {
						this.setHeight(Math.abs(this.scrollTop))
					}
				}
			},
			touchMoveEventHandler(e) {
				const touchY = e.touches[0].clientY
				const deltaY = touchY - this.touchY
				this.deltaY = deltaY
				// console.log('touchMove', deltaY,this.scroll.scrollTop)
				if (deltaY > 0) {
					this.setHeight(deltaY)
				}
			},
			touchStartEventHandler(e) {
				this.touchY = e.touches[0].clientY
			},
			touchEndEventHandler(e) {
				this.touchY = 0
				// console.log('touchEnd', e)
				this.setStopAndLoading()
			},
			setStopAndLoading() {
				// 如果组件有loading事件，则触发
				if (this.startLoading && this.deltaY >= this.height && this.scroll.scrollTop <= 0) {
					// 正在加载状态
					this.status = 'loading'
					this.loadingAnimation()
					// console.log('startDownLoading')
					this.startLoading(this)
				} else {
					this.success()
				}
			},
			success() {
				// console.log('success')
				setTimeout(() => {
					this.reset()
				}, 600)
			},
			error() {
				// console.log('error')
				setTimeout(() => {
					this.reset()
				}, 600)
			},
			theend(text){

			},
			restart(){}
		},
		mounted() {
			this.observeScroll()
			this.reset()
		},
		beforeDestroy() {
			this.scroll.removeEventListener('scroll', this.scrollHandler)
			this.$el.removeEventListener('touchmove', this.touchMoveHandler)
			this.$el.removeEventListener('touchstart', this.touchStartHandler)
			this.$el.removeEventListener('touchend', this.touchEndHandler)
		}
	}
</script>
