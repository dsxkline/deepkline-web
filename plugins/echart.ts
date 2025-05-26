import dark from '@/assets/json/echart.dark.json';
import light from '@/assets/json/echart.light.json';
import * as echarts from 'echarts'

export default defineNuxtPlugin(() => {
    echarts.registerTheme("dark", dark);
    echarts.registerTheme("light", light);
    // console.log('echarts',echarts)
})