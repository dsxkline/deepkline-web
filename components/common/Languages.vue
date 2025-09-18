<script setup lang="ts">
	import { useSyncedCookie } from '~/composable/useSyncedCookie'
	const { setLocale, locales, locale, localeProperties } = useI18n()
	const langPopover = ref()
	const visible = ref(false)
	const loading = ref(false)
	const emit = defineEmits<{
		(event: 'onClose', lang: string): void
	}>()
	const currentLang = ref(locale.value)
	const changeLanguage = async (lang: any) => {
		loading.value = true
		currentLang.value = lang
		setTimeout(() => {
			useSyncedCookie('i18n_redirected', { default: () => 'zh-CN' }).value = lang
			// 1) SPA 切换：直接改语言，不跳转
			setLocale(lang)
			loading.value = false
			emit('onClose', lang)
			langPopover.value?.hide()
		}, 100)
		// 2) 如果你想让 URL 同步变化（路由模式）
		// const path = useSwitchLocalePath()(lang)
		// navigateTo(path)
	}

	onBeforeUnmount(() => {
		langPopover.value = null
	})
	onMounted(() => {
		visible.value = true
	})
</script>
<template>
	<div>
		<button class="flex items-center justify-center" v-click-sound v-if="!visible">
			<LanguagesIcon />
		</button>
		<el-popover ref="langPopover" placement="bottom" trigger="click" width="auto" popper-class="!p-0 !min-w-0" v-else>
			<template #reference>
				<button class="flex items-center justify-center" v-click-sound>
					<LanguagesIcon />
				</button>
			</template>

			<div class="bg-[--transparent05]">
				<ul>
					<li
						:class="['flex items-center justify-center h-[40px] text-sm px-6 hover:bg-[--transparent05] cursor-pointer text-grey', currentLang == item.code ? '!text-main' : '']"
						v-for="item in locales"
						:key="item.code"
						@click="changeLanguage(item.code)"
						v-click-sound
					>
						{{ item.name }}
						<Loading v-if="loading && currentLang == item.code" size="14px" class="pl-1" />
					</li>
				</ul>
			</div>
		</el-popover>
	</div>
</template>

<style lang="less" scoped></style>
