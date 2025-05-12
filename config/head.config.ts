import {version} from '../package.json'
export default {
    title: "DeepKline is the most silky cryptocurrency trading system.",
    htmlAttrs: {
        lang: "zh-CN",
    },
    meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
            name: "viewport",
            content: "width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        },
        { name: "format-detection", content: "telephone=no" }
    ],
    link: [
        
    ],
    script: [
        {
            src:'/js/dsx.kline_v_3_1_0.js?v='+version
        },
        {
            src:'/js/qq.hq_v_3_1_0.js?v='+version
        },
        {
            src:'/kline.js?v='+version
        }
    ]
}