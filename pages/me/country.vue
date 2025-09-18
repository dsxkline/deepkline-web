<script lang="ts" setup>
	import countries from 'i18n-iso-countries'
	import CountryFlag from 'vue-country-flag-next'
	import enLocale from 'i18n-iso-countries/langs/en.json'
	const { t } = useI18n()
	countries.registerLocale(enLocale) // 注册语言
	console.log('countries', countries.getNames('en'))
	const countryOptions = computed(() => {
		return Object.entries(countries.getNames('en')).map(([code, name]) => ({
			name: name,
			code: code
		}))
	})
</script>
<template>
	<div>
		<AppStatusBar/>
		<NavigationBar :title="t('选择国家')" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }" :always="false">
			<ul class="px-4 pl-1 *:flex *:items-center *:py-1 [&_b]:flex [&_b]:items-center">
				<template v-for="{ name, code } in countryOptions">
					<li>
						<CountryFlag :country="code" class="flex items-center !m-0"/>
						<span>{{ name }}</span>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
