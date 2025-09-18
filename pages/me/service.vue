<script setup lang="ts">
	import { useStore } from '~/store'
    const { t,locale } = useI18n()
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
</style>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('服务条款')" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<div v-if="locale == 'zh-CN'" class="p-4">
				<p><strong>生效日期：</strong>2025-09-10</p>
				<p>欢迎使用本平台。在使用我们的服务前，请仔细阅读并理解以下条款。</p>
				<section>
					<h2>1. 服务范围</h2>
					<p>本平台提供加密货币聚合交易服务，包括行情聚合、订单路由与交易执行。本平台不发行任何代币，也不提供法币兑换。</p>
				</section>

				<section>
					<h2>2. 用户资格</h2>
					<p>您需年满18周岁，并遵守当地法律法规。</p>
				</section>
				<section>
					<h2>3. 风险提示</h2>
					<p>加密货币波动剧烈，存在高风险，您可能会损失部分或全部资金。本平台不提供投资建议。</p>
				</section>

				<section>
					<h2>4. 账户与安全</h2>
					<p>您有责任妥善保管账户、API Key、私钥等信息，因个人原因造成的损失由您自行承担。</p>
				</section>

				<section>
					<h2>5. 服务费用</h2>
					<p>平台可能收取一定的交易手续费或API费用，具体以公告为准。</p>
				</section>

				<section>
					<h2>6. 禁止行为</h2>
					<p>禁止违法犯罪、攻击平台安全或规避风控等行为。</p>
				</section>

				<section>
					<h2>7. 免责声明</h2>
					<p>因第三方交易所或不可抗力导致的损失，本平台不承担责任。</p>
				</section>

				<section>
					<h2>8. 知识产权</h2>
					<p>本平台的代码、界面、商标等受知识产权保护。</p>
				</section>

				<section>
					<h2>9. 服务变更与终止</h2>
					<p>本平台有权修改、暂停或终止服务。</p>
				</section>

				<section>
					<h2>10. 法律适用与争议解决</h2>
					<p>本条款受适用法律管辖，争议提交至指定机构解决。</p>
				</section>

				<section>
					<h2>11. 联系方式</h2>
					<p>Email: support@example.com</p>
				</section>
			</div>

			<div v-else-if="locale == 'zh-TW'" class="p-4">
				<p><strong>生效日期：</strong>YYYY-MM-DD</p>
				<p>歡迎使用本平台。在使用我們的服務前，請仔細閱讀並理解以下條款。</p>

				<section>
					<h2>1. 服務範圍</h2>
					<p>本平台提供加密貨幣聚合交易服務，包括行情聚合、訂單路由與交易執行。本平台不發行任何代幣，也不提供法幣兌換。</p>
				</section>

				<section>
					<h2>2. 使用資格</h2>
					<p>您需年滿18週歲，並遵守當地法律法規。</p>
				</section>

				<section>
					<h2>3. 風險提示</h2>
					<p>加密貨幣波動劇烈，存在高風險，您可能會損失部分或全部資金。本平台不提供投資建議。</p>
				</section>

				<section>
					<h2>4. 帳戶與安全</h2>
					<p>您有責任妥善保管帳戶、API Key、私鑰等資訊，因個人原因造成的損失由您自行承擔。</p>
				</section>

				<section>
					<h2>5. 服務費用</h2>
					<p>平台可能收取一定的交易手續費或API費用，具體以公告為準。</p>
				</section>

				<section>
					<h2>6. 禁止行為</h2>
					<p>禁止違法犯罪、攻擊平台安全或規避風控等行為。</p>
				</section>

				<section>
					<h2>7. 免責聲明</h2>
					<p>因第三方交易所或不可抗力導致的損失，本平台不承擔責任。</p>
				</section>

				<section>
					<h2>8. 知識產權</h2>
					<p>本平台的程式碼、介面、商標等受知識產權保護。</p>
				</section>

				<section>
					<h2>9. 服務變更與終止</h2>
					<p>本平台有權修改、暫停或終止服務。</p>
				</section>

				<section>
					<h2>10. 法律適用與爭議解決</h2>
					<p>本條款受適用法律管轄，爭議提交至指定機構解決。</p>
				</section>

				<section>
					<h2>11. 聯絡方式</h2>
					<p>Email: support@example.com</p>
				</section>
			</div>

			<div v-else class="p-4">
				<p><strong>Effective Date:</strong> YYYY-MM-DD</p>
				<p>Welcome to our platform. Please read and understand the following terms before using our services.</p>

				<section>
					<h2>1. Scope of Services</h2>
					<p>Our platform provides crypto aggregation trading services including market data aggregation, order routing, and execution. We do not issue tokens or provide fiat exchange.</p>
				</section>

				<section>
					<h2>2. Eligibility</h2>
					<p>You must be at least 18 years old and comply with applicable laws and regulations.</p>
				</section>

				<section>
					<h2>3. Risk Disclosure</h2>
					<p>Cryptocurrencies are highly volatile and risky. You may lose part or all of your funds. This platform does not provide investment advice.</p>
				</section>

				<section>
					<h2>4. Accounts & Security</h2>
					<p>You are responsible for safeguarding your account, API keys, and private keys. Losses caused by your own actions are your responsibility.</p>
				</section>

				<section>
					<h2>5. Fees</h2>
					<p>Our platform may charge trading or API fees, subject to published announcements.</p>
				</section>

				<section>
					<h2>6. Prohibited Conduct</h2>
					<p>You may not engage in illegal activity, security attacks, or risk control evasion.</p>
				</section>

				<section>
					<h2>7. Disclaimer</h2>
					<p>We are not liable for losses arising from third-party exchanges or force majeure events.</p>
				</section>

				<section>
					<h2>8. Intellectual Property</h2>
					<p>Our code, interface, and trademarks are protected by intellectual property laws.</p>
				</section>

				<section>
					<h2>9. Changes & Termination</h2>
					<p>We reserve the right to modify, suspend, or terminate services.</p>
				</section>

				<section>
					<h2>10. Governing Law & Dispute Resolution</h2>
					<p>These terms are governed by applicable law. Disputes shall be submitted to designated authorities.</p>
				</section>

				<section>
					<h2>11. Contact Information</h2>
					<p>Email: support@example.com</p>
				</section>
			</div>
		</ScrollBar>
	</div>
</template>
