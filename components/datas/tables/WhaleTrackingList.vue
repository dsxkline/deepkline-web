<script setup lang="ts">
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import { usePush } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { MainForceDto } from '~/fetch/dtos/symbol.dto'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
		pageSize?: number
		height?: number
		source?: string
	}>()
	const loading = ref(false)
	const error = ref('')
	const datas = ref<MainForceDto[]>([])
	let page = 1
	let pageSize = props.pageSize || 10

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 0
	})

	function getMainForceList() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.mainforce(page, pageSize)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
					if (props.source == 'home') {
						// 收集订阅
						pageSubSymbols.addSubSymbols(datas.value.map(item => item.symbol))
					}
				} else {
					if (!datas.value?.length) error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				if (!datas.value?.length) error.value = t('网络异常，请稍后再试')
			})
	}

	// 使用页面订阅收集器
	const pageSubSymbols = useAddPageSubSymbols()

	const push = usePush()
	function clickSymbol(item?: MainForceDto) {
		if (useStore().isH5) {
			const params = {
				symbol: item?.symbol
			}
			push(SymbolDetail, params)
			return
		}
	}

	function update() {
		getMainForceList()
	}

	onMounted(() => {})

	defineExpose({
		update
	})
</script>
<template>
	<div :style="{ height: height ? +contentHeight + 'px' : 'max-content' }">
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getMainForceList">{{ t('重新加载') }}</el-button>
			</template>
		</Error>
		<Empty :msg="error" v-if="!loading && !error && !datas.length">
			<template #default>
				<el-button @click.stop="getMainForceList">{{ t('重新加载') }}</el-button>
			</template>
		</Empty>
		<ScrollBar class="w-full h-full" :noScroll="!height" :style="{ height: height ? +contentHeight + 'px' : 'auto' }" :always="false" v-if="!loading && !error && datas.length">
			<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between py-2">
				<template v-for="item in datas">
					<li @click="clickSymbol(item)">
						<div class="col-span-2" v-autosize="16">
							<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
							<span v-else> -- </span>
						</div>
						<div class="col-span-3 flex-auto grid grid-cols-4 w-full text-[10px] *:py-1 *:rounded-sm *:bg-[--transparent02] *:text-[--transparent10] gap-2">
							<button
								:style="[
									item.scorer?.absorption && item.scorer?.absorption - 100
										? 'background:rgb(var(--color-blue) / ' + (item.scorer?.absorption - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.absorption - 100) / 100 + ')'
										: ''
								]"
							>
								{{t('吸筹')}}
							</button>
							<button
								:style="[
									item.scorer?.rally && item.scorer?.rally - 100
										? 'background:rgb(var(--color-green) / ' + (item.scorer?.rally - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.rally - 100) / 100 + ')'
										: ''
								]"
							>
								{{t('拉升中')}}
							</button>
							<button
								:style="[
									item.scorer?.distribution && item.scorer?.distribution - 100
										? 'background:rgb(var(--color-red) / ' + (item.scorer?.distribution - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.distribution - 100) / 100 + ')'
										: ''
								]"
							>
								{{t('出货')}}
							</button>
							<button
								:style="[
									item.scorer?.trap && item.scorer?.trap - 100
										? 'background:rgb(var(--color-brand) / ' + (item.scorer?.trap - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.trap - 100) / 100 + ')'
										: ''
								]"
							>
								{{t('诱多')}}
							</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>

		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-else-if="loading && !error">
			<template v-for="item in pageSize">
				<div class="h-10 flex items-center">
					<el-skeleton :rows="0" animated class="col-span-2 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 70%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="col-span-3 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 100%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
			</template>
		</div>
	</div>
</template>