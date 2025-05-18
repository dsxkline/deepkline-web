import type { ComponentInternalInstance } from "vue";

export const usePushStore = defineStore({
    id: 'push',
    state: () => ({
        // push vue 组件数组
        pushComopnents: [] as ComponentInternalInstance[],
        pushing: false,
    }),
    actions: {
        setPushState(ing: boolean) {
            this.pushing = ing;
        },
        push(comp: ComponentInternalInstance|null) {
            if (comp) this.pushComopnents.push(comp as any);
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
        getPushComponent(comp: ComponentInternalInstance|null) {
            const index = this.pushComopnents.findIndex((item:any) => {
                console.log(item, comp)
                return item.uid == comp?.uid;
            });
            console.log('mounted', comp, index)
            return index;
        },
    }
})