import ArmsRum from '~/utils/aliyun.arms'

export default defineNuxtPlugin(({ vueApp }) => {
	console.log('ArmsRum.version', ArmsRum.version)
	ArmsRum.sendEvent({
		key: 'buy_click',
		value: 1,
		msg: '测试'
	})
})
