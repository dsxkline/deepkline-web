
// 定义一个vue组件的类型
type PushComponent = {
    popData: any;
    $el: HTMLElement;
}

export const usePushStore = defineStore({
    id: 'main',
    state: () => ({
        // push vue 组件数组
        pushComopnents: <PushComponent[]>[],
        pushing: false,
    }),
    actions: {
        setPushState(ing: boolean) {
            this.pushing = ing;
        },
        push(comp: PushComponent) {
            this.pushComopnents.push(comp);
        },
        pop(index: number | null = null) {
            if (index === null) {
                this.pushComopnents.pop();
            } else {
                this.pushComopnents.splice(index, 1);
            }
        },
        getTopPush() {
            return this.pushComopnents[this.pushComopnents.length - 1];
        },
        getPushComponent(comp: PushComponent) {
            const index = this.pushComopnents.find((item: any) => item === comp);
            //console.log('mounted',_uid,index)
            return index;
        },
    }
})