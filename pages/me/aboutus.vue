<script setup lang="ts">
	import { useStore } from '~/store'
	const COMPANY_NAME = 'DeepKline'
	const { locale } = useI18n()
</script>
<style lang="less" scoped>
	p {
		@apply text-sm text-grey;
	}

	h2 {
		@apply text-base py-2;
	}
	strong {
		@apply text-main;
	}
	ul {
		@apply p-4 text-sm;
		li {
			list-style: decimal;
		}
	}
</style>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar title="关于我们" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<div v-if="locale == 'zh-CN'" class="p-4">
				<p>我们是一家专注于加密货币聚合交易的科技公司，致力于为用户提供高效、安全、透明的交易体验。</p>

				<section>
					<h2>我们的使命</h2>
					<p>降低用户在不同交易所之间的操作复杂度，帮助用户获取最佳价格与流动性。</p>
				</section>

				<section>
					<h2>我们的团队</h2>
					<p>由来自区块链技术、金融工程和安全领域的专业人士组成。</p>
				</section>

				<section>
					<h2>联系我们</h2>
					<p>Email: contact@deepkline.com</p>
				</section>
			</div>

			<div v-else-if="locale == 'zh-TW'" class="p-4">
				<p>我們是一家專注於加密貨幣聚合交易的科技公司，致力於為使用者提供高效、安全、透明的交易體驗。</p>

				<section>
					<h2>我們的使命</h2>
					<p>降低使用者在不同交易所之間的操作複雜度，幫助使用者獲取最佳價格與流動性。</p>
				</section>

				<section>
					<h2>我們的團隊</h2>
					<p>由來自區塊鏈技術、金融工程和安全領域的專業人士組成。</p>
				</section>

				<section>
					<h2>聯絡我們</h2>
					<p>Email: contact@deepkline.com</p>
				</section>
			</div>

			<div v-else class="p-4">
				<p>We are a technology company focused on crypto aggregation trading, dedicated to providing users with an efficient, secure, and transparent trading experience.</p>

				<section>
					<h2>Our Mission</h2>
					<p>To reduce the complexity of operating across multiple exchanges and help users access the best prices and liquidity.</p>
				</section>

				<section>
					<h2>Our Team</h2>
					<p>Composed of professionals from blockchain technology, financial engineering, and cybersecurity fields.</p>
				</section>

				<section>
					<h2>Contact Us</h2>
					<p>Email: contact@deepkline.com</p>
				</section>
			</div>
		</ScrollBar>
	</div>
</template>
