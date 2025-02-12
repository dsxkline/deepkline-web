export const usePushStore = defineStore({
    id: 'push',
    state: () => ({
        // push vue 组件数组
        pushComopnents: <any[]>[],
        pushing: false,
    }),
    actions: {
        setPushState(ing: boolean) {
            this.pushing = ing;
        },
        push(comp: any | null) {
            if (comp) this.pushComopnents.push(comp);
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
        getPushComponent(comp: any) {
            const index = this.pushComopnents.findIndex((item: any) => {
                console.log(item, comp)
                return item.uid == comp.uid;
            });
            console.log('mounted', comp, index)
            return index;
        },
    }
})