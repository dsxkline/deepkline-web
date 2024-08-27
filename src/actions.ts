import { initGlobalState, type MicroAppStateActions } from "qiankun";

const initialState = {
  sign: '',
  scroll: 0,
  behavior: 'smooth'
};

/**
 * 事件传递还是要少用，毕竟作为qiankun的子应用是可以独立运行的
 * sign 子应用传给父应用的事件
 */

// 定义全局状态，并返回通信方法，建议在主应用使用，微应用通过 props 获取通信方法
const actions: MicroAppStateActions = initGlobalState(initialState);

// 父应用通过 actions.onGlobalStateChange 监听子应用状态变化
actions.onGlobalStateChange((state, prev) => {
  // console.log('主应用检测到state变更：', state);
  // state: 变更后的状态; prev 变更前的状态
  switch (state.sign) {
    case 'aaa':
      handleEvent()
      break;
  }
});

const handleEvent = () => {
    // 此处写方法
}
 

export default actions;
