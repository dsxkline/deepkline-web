<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { MainForceDto } from '~/fetch/dtos/symbol.dto'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { useSymbolStore } from '~/store/symbol'
	const loading = ref(false)
	const error = ref('')
	const datas = ref<MainForceDto[]>([])

	function getMainForceList() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.mainforce()
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
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
	<div class="py-2">
		<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-if="!loading">
			<template v-for="item in datas">
				<li>
					<div class="col-span-2" v-autosize="16">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
						<span v-else> -- </span>
					</div>
					<div class="col-span-3 flex-auto grid grid-cols-4 w-full text-[10px] *:py-1 *:rounded-sm *:bg-[--transparent02] *:text-[--transparent10] gap-2">
						<button
							:style="[
								item.scorer?.absorption && item.scorer?.absorption - 100
									? 'background:rgb(var(--color-brand) / ' + (item.scorer?.absorption - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.absorption - 100) / 100 + ')'
									: ''
							]"
						>
							吸筹
						</button>
						<button
							:style="[
								item.scorer?.rally && item.scorer?.rally - 100 ? 'background:rgb(var(--color-green) / ' + (item.scorer?.rally - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.rally - 100) / 100 + ')' : ''
							]"
						>
							拉升中
						</button>
						<button
							:style="[
								item.scorer?.distribution && item.scorer?.distribution - 100
									? 'background:rgb(var(--color-red) / ' + (item.scorer?.distribution - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.distribution - 100) / 100 + ')'
									: ''
							]"
						>
							出货
						</button>
						<button
							:style="[
								item.scorer?.trap && item.scorer?.trap - 100 ? 'background:rgb(var(--color-brand) / ' + (item.scorer?.trap - 100) / 100 + ');color:rgb(var(--color-text-main)/' + (item.scorer?.trap - 100) / 100 + ')' : ''
							]"
						>
							诱多
						</button>
					</div>
				</li>
			</template>
		</ul>
		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-else>
			<template v-for="item in 10">
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
<style lang="less" scoped>
	.accumulating {
	}
</style>
