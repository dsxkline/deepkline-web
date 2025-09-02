<script lang="ts" setup>
    const android = 'https://download.deepkline.com/android/v1/app-release.apk'
    const win = 'https://download.deepkline.com/win/v1/deepkline-desktop-1.0.0-setup.exe'
    const mac = 'https://download.deepkline.com/mac/v1/deepkline-desktop-1.0.0.dmg'
    const ios = ''
    const pwa = ''
</script>
<template>
	<div class="download-page p-4 flex flex-col items-center justify-center h-full">
		<div class="text-3xl mt-[-100px]">连接全球顶尖经纪商</div>
		<div class="text-grey pb-10 pt-2 text-xl">实战是检验真理的唯一标准</div>
		<div class="flex items-center justify-center gap-4">
			<a class="py-4 px-10 bg-[--transparent05] rounded-xl glass overflow-hidden hover:bg-[--transparent10]" :href="android" target="_blank">Android 下载</a>
			<a class="py-4 px-10 bg-[--transparent05] rounded-xl overflow-hidden text-grey" :href="ios" target="_blank">iOS 下载</a>
			<a class="py-4 px-10 bg-[--transparent05] rounded-xl glass overflow-hidden hover:bg-[--transparent10]" :href="win" target="_blank">Windows 下载</a>
            <a class="py-4 px-10 bg-[--transparent05] rounded-xl glass overflow-hidden hover:bg-[--transparent10]" :href="mac" target="_blank">Mac 下载</a>
			<a class="py-4 px-10 bg-[--transparent05] rounded-xl overflow-hidden text-grey" :href="pwa" target="_blank">PWA Lite 版本</a>
		</div>
	</div>
</template>
