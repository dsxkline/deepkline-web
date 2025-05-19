import { defineStore } from 'pinia'
import { ApiSource } from '~/types/types.d'

export const useStore = defineStore({
	id: 'main',
	state: () => ({
    isLeave:false,
    unload:false, // 页面是否卸载，如果卸载需要清理vue实例
		apiSource: ApiSource.OKX,
		hideSplitLeft: false,
		hideSplitRight: false,
		screenDoms: [] as any[],
		splitScreen: 3, // 1=单屏 2=分屏 3=三屏
    bodyHeight: 0,
    bodyWidth: typeof window=="undefined"?0:window.innerWidth,
	}),
	actions: {
    setBodyHeight(height: number) {
      this.bodyHeight = height
      console.log('body height',height)
    },
    setBodyWidth(width: number) {
      this.bodyWidth = width
      console.log('body width',width)
    },
		setApiSource(source: ApiSource) {
			this.apiSource = source
		},
		setSplitLeft(index: number, hide: boolean) {
			const dom = this.screenDoms[index]
      if (dom) {
        dom.hideSplitLeft = hide
      }
      this.updateSplitScreen()
		},
		setSplitRight(index: number, hide: boolean) {
			const dom = this.screenDoms[index]
      if (dom) {
        dom.hideSplitRight = hide
      }
      this.updateSplitScreen()
		},
		// 更新分屏数量
		updateSplitScreen() {
			this.splitScreen = this.screenDoms.filter(item => !item?.hideSplitLeft && !item?.hideSplitRight).length+1
		},
		setSplitScreen(split: number) {
			this.splitScreen = split
      // 3
      if(this.splitScreen == 3) this.screenDoms.forEach(item=>item.hideSplitLeft = false)
      if(this.splitScreen == 1) {
        this.screenDoms.forEach(item=>item.hideSplitLeft = true)
      }
      if(split == 2) {
        this.updateSplitScreen()
        // 是否是两屏
        if(this.splitScreen==1){
          // 增加一屏
          if(this.screenDoms.length>=1) this.screenDoms[this.screenDoms.length-1].hideSplitLeft = false
        }
        if(this.splitScreen==3){
          // 减少一屏
          if(this.screenDoms.length>=1) this.screenDoms[0].hideSplitLeft = true
        }
        
      }
      this.updateSplitScreen()
		},
		addSplitScreen(splitDom: any) {
			if (!this.screenDoms.includes(splitDom)) this.screenDoms.push(splitDom)
			this.updateSplitScreen()
		},
		removeSplitScreen(splitDom: any) {
			this.screenDoms = this.screenDoms.filter(item => item !== splitDom)
			this.updateSplitScreen()
		}
	},
  getters:{
    // 是否是H5模式
    isH5(state){
      // console.log('body width state.bodyWidth',state.bodyWidth,useNuxtApp().$isMobile)
      return (state.bodyWidth>0 || useNuxtApp().$isMobile) && state.bodyWidth<999
    }
  }
})
