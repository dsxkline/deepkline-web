<script setup lang="ts">
	const langPopover = ref()
	const visible = ref(false)
	const emit = defineEmits<{
		(event: 'onClose', lang: string): void
	}>()
	const languages = ref(useCookie('languages', { default: () => 'zh-CN' }))
	const languageList = [
		{
			label: '简体中文',
			value: 'zh-CN'
		},
		{
			label: '繁體中文',
			value: 'zh-TW'
		},
		{
			label: 'English',
			value: 'en-US'
		}
	]
	const changeLanguage = (lang: string) => {
		languages.value = lang
		useCookie('languages', { default: () => 'zh-CN' }).value = lang
		emit('onClose', lang)
		langPopover.value?.hide()
	}

	onBeforeUnmount(() => {
		langPopover.value = null
	})
	onMounted(()=>{
		visible.value = true
	})
</script>
<template>
	<div>
		<button class="flex items-center justify-center" click-sound v-if="!visible">
			<LanguagesIcon />
		</button>
		<el-popover ref="langPopover" placement="bottom" trigger="click" width="auto" popper-class="!p-0 !min-w-0" v-else>
			<template #reference>
				<button class="flex items-center justify-center" click-sound>
					<LanguagesIcon />
				</button>
			</template>

			<div class="bg-[--transparent05]">
				<ul>
					<li
						:class="['flex items-center justify-center h-[40px] text-sm px-6 hover:bg-[--transparent05] cursor-pointer', languages == item.value ? 'text-main' : '']"
						v-for="item in languageList"
						:key="item.value"
						@click="changeLanguage(item.value)"
						click-sound
					>
						{{ item.label }}
					</li>
				</ul>
			</div>
		</el-popover>
	</div>
</template>

<style lang="less" scoped></style>
