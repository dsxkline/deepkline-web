<template>
    <div class="register-container">
        <div class="global-form p-10">
            <div class="form-item my-4">
                <b>邮箱登录</b>
                <el-input :placeholder="'请输入邮箱'" size="large"></el-input>
            </div>
       
            <div class="form-item mt-8">
                <button class="w-full bt-default !py-2 !text-sm !text-grey">登录</button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.global-form{
    .form-item{
        @apply flex flex-col;
    }
}
</style>