<template>
	<div class="register-container">
		<div class="global-form p-6">
			<div class="form-item my-4">
				<!-- <label>邮箱登录:</label> -->
				<el-input :placeholder="'请输入邮箱 例如:deepkline@gmail.com'" size="large"></el-input>
			</div>

			<div class="form-item mt-8">
				<button class="w-full bt-default !py-2 !text-sm !text-grey !bg-[--transparent01] !border-[--transparent01]">下一步</button>
			</div>

			
		</div>
	</div>
</template>

<style lang="less" scoped>
	.global-form {
		.form-item {
			@apply flex flex-col;
			label {
				@apply py-2;
			}
			:deep(.el-input) {
				.el-input__wrapper {
				}
			}
		}
	}
</style>
