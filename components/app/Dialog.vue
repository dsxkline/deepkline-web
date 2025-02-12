<template>
    <el-dialog v-model="dialogVisible" width="500" :before-close="handleClose">

        <template #title v-if="title">{{ title }}</template>
        <template #default v-if="msg">{{ msg }}</template>
        <template #default v-if="to">
            <component :is="to" :push="true" @close="handleClose" v-bind="params" />
        </template>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getCurrentInstance, render } from 'vue'
// import SymbolSearch from '../symbol/SymbolSearch.vue';
const instance = getCurrentInstance()
const props = defineProps<{
    size: string;
    asyncComponent: Component;
    url: string;
    to: string;
    title: string;
    msg: string;
    params: any;
}>();


const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
    //   ElMessageBox.confirm('Are you sure to close this dialog?')
    //     .then(() => {
    //       done()
    //     })
    //     .catch(() => {
    //       // catch error
    //     })
}
</script>