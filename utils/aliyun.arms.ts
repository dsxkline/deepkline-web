import ArmsRum from '@arms/rum-browser'

ArmsRum.init({
    pid: 'd6dn0uob3o@8fb249302864f31',
    endpoint: 'https://d6dn0uob3o-default-sea.rum.aliyuncs.com',
    // 设置环境信息，参考值：'prod' | 'gray' | 'pre' | 'daily' | 'local'
    env: process.env.NODE_ENV == 'production' ? 'prod' : 'local',
    // 设置路由模式， 参考值：'history' | 'hash'
    spaMode: 'history',
    collectors: {
        // 页面性能指标监听开关，默认开启
        perf: true,
        // WebVitals指标监听开关，默认开启
        webVitals: true,
        // Ajax监听开关，默认开启
        api: true,
        // 静态资源开关，默认开启
        staticResource: true,
        // JS错误监听开关，默认开启
        jsError: true,
        // 控制台错误监听开关，默认开启
        consoleError: true,
        // 用户行为监听开关，默认开启
        action: true
    },
    // 链路追踪配置开关，默认关闭
    tracing: true
})

export default ArmsRum