<template>
	<div :style="{ 'min-height': fontHeight + 'px' }">
		<ul v-show="fontWidth <= 0">
			<li>{{ unit }}{{ value }}</li>
		</ul>
		<ul class="number-container" v-show="fontWidth > 0"  v-observe-visible.multi="onObserveVisible">
			<li
				:style="{
					height: fontHeight + 'px'
				}"
			>
				<span
					:style="{
						height: fontHeight + 'px',
						transform: 'translateY(0%)'
					}"
				>
					<i>{{ unit }}</i>
				</span>
			</li>
			<li
				:class="{ 'number-item': !isNaN(item), 'mark-item': isNaN(item) }"
				v-for="(item, index) in orderNum"
				:style="{
					height: fontHeight + 'px'
				}"
			>
				<span :class="'numdom-' + index" v-if="!isNaN(item)" :data-index="index" :data-number="item">
					<i
						v-for="(i, index) in 10"
						:style="{
							height: fontHeight + 'px'
						}"
					>
						{{ index }}
					</i>
				</span>
				<span :class="'comma numdom-' + index" v-else>
					<i>{{ item }}</i>
				</span>
			</li>
		</ul>
	</div>
</template>
<script>
	export default {
		props: {
			value: {
				type: String, // 具体数值
				default() {
					return '0'
				}
			},
			time: {
				type: Number, // 滚动要花的时间，单位秒
				default() {
					return 0.3
				}
			},
			unit: {
				type: String,
				default() {
					return '$'
				}
			},
			fontSize: {
				type: Number,
				default: 12
			},
			fontWeight: {
				type: Number,
				default: 600
			}
		},
		watch: {
			value: function (val) {
				if (window.dsxKlineScrolling) return
				if (this.fontWidth > 0 && this.inited) this.updateNumbers()
			}
		},
		data() {
			return {
				orderNum: ['0', '0', ',', '0', '0', '0', ',', '0', '0', '0'],
				fontWidth: 0,
				fontHeight: this.fontSize,
				digWidth: 0,
				width: 0,
				textHeight: 0,
				inited: false,
				timer: null,
				interVisible:false
			}
		},
		beforeUnmount() {
			// Object.keys(this.$refs).forEach(key => {
			// 	this.$refs[key] = null
			// })
			if (this.timer) clearTimeout(this.timer)
		},
		mounted() {
			//console.log("this.value", this.value);
			this.setDefaultDisplay()
			this.timer = setTimeout(() => {
				this.inited = true
			}, this.time * 1000)
		},
		methods: {
			onObserveVisible(visible){
				this.interVisible = visible;
				// console.log('inview numberincrease',this.interVisible)
			},
			setDefaultDisplay() {
				this.setNumberWidth()
				this.$nextTick(() => {
					this.resetNumbers()
					this.updateNumbers()
					//console.log("this.orderNum", this.isTopLayer(), this.orderNum);
				})
			},
			updateNumbers() {
				// if (!this.isTopLayer()) return;
				this.setNumberList()
				this.setNumberWidth()
				this.$nextTick(() => {
					this.resetNumbers()
				})
			},
			setNumberList() {
				this.orderNum = (this.value + '').split('') || ''
			},
			resetNumbers() {
				this.textHeight = this.fontSize * 10
				// 重置每个数字的位置
				this.orderNum.forEach((n, i) => {
					const ndom = this.$el.querySelector('.numdom-' + i)
					if (ndom) {
						// ndom.style.transition = `all ${this.time}s ease`
						// if(!this.interVisible) ndom.style.transition = 'none';
						if (!isNaN(n) && n != '.' && n != ',') {
							const translateY = this.getNumberY(n, ndom)
							ndom.style.transform = translateY
							//ndom.style.transition = `all ${this.time}s ease`
							//   ndom.style.top = translateY;
						} else {
							// const translateY = this.getNumberY(0, ndom)
							ndom.style.transform = 'translateY(0%)'
							//ndom.style.transition = `all ${this.time}s ease`
							//   ndom.style.top = 0;
						}
					}
				})
			},
			getNumberY(number, target) {
				number = parseInt(number)
				// 设置某个数字所在的偏移距离
				// 每个数字的高度
				const nHeight = this.fontSize
				// 每个字的间距
				const space = (this.textHeight - 10 * this.fontHeight) / 8
				const translateY = 'translateY(calc(' + (45 - (number / 10) * 100) + '%)'
				//   const translateY =
				//     "calc(-" +
				//     (number / 10.0) * this.textHeight +
				//     "px - " +
				//     (space) / 2 +
				//     "px)";
				// console.log('getNumberY',number,translateY)
				return translateY
			},
			setNumberWidth() {
				const { width, height } = this.getTextWidth(this.unit + this.value, this.fontSize, this.fontWeight) //this.$refs.hideNumber.getBoundingClientRect().width;
				if (width > 0) {
					this.fontHeight = height
					this.fontWidth = width / this.value.length
					this.digWidth = (this.fontWidth / 4) * 2
				}
			},
			getTextWidth(text, fontSize, fontWeight = 700, fontFamily = 'DIN') {
				const span = document.createElement('span')
				span.style.visibility = 'hidden'
				span.style.whiteSpace = 'nowrap' // 防止文本换行
				//   span.style.display = "flex";
				span.style.fontSize = fontSize + 'px'
				span.style.fontFamily = fontFamily || 'Arial'
				span.style.fontWeight = fontWeight || 700
				span.textContent = text
				document.body.appendChild(span)
				const width = span.offsetWidth
				const height = span.offsetHeight
				document.body.removeChild(span)
				return { width, height }
			}
		}
	}
</script>
<style scoped lang="less">
	ul {
		display: flex;
	}

	.number-container {
		position: relative;
		display: flex;
		transition: all 0.3s ease;

		li {
			overflow: hidden;
			display: flex;
			align-items: center;
			transition: all 0.3s ease;

			span {
				transform: translateY(45%);
				transition: all 0.3s ease;
				display: flex;
				align-items: center;
				justify-content: flex-start;
				flex-direction: column;
				height: max-content;

				i {
					font-style: normal;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					height: 100%;
				}

				//   position: absolute;
				//   top: 0;
			}
		}
	}
</style>
