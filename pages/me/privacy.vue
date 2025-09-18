<script setup lang="ts">
	import { useStore } from '~/store'
	const COMPANY_NAME = 'DeepKline'
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
	ul{
		@apply p-4 text-sm;
		li{
			list-style:decimal;
		}
	}
</style>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :title="t('隐私政策')" />
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--app-status-bar-height))' }">
			<div v-if="locale == 'zh-CN'" class="p-4">
				<section>
					<h2>一、总则</h2>
					<p>欢迎使用 {{ COMPANY_NAME }}（“本公司”、“我们”）。我们重视您的隐私并致力于保护您的个人信息。请在使用我们的服务前仔细阅读本隐私政策。</p>
				</section>

				<section>
					<h2>二、我们收集的信息</h2>
					<p>我们可能收集和处理以下类型的信息：</p>
					<ul>
						<li>账户信息：注册姓名、邮箱、电话号码、KYC/身份验证资料（如适用）；</li>
						<li>交易与资金数据：交易记录、订单、成交明细、资金出入等；</li>
						<li>设备与日志信息：IP、设备型号、操作系统、浏览器、访问日志；</li>
						<li>Cookie 与追踪数据：用于登录状态、偏好设置、性能优化与分析；</li>
						<li>沟通记录：客服对话、邮件、工单内容。</li>
					</ul>
				</section>

				<section>
					<h2>三、我们如何使用信息</h2>
					<p>收集的信息用于如下目的：</p>
					<ul>
						<li>提供、维护与改进我们的服务；</li>
						<li>交易执行、清算与结算；</li>
						<li>风险管理与合规（包括反洗钱、制裁筛查）；</li>
						<li>客户支持与沟通；</li>
						<li>安全监控、反欺诈与平台保护；</li>
						<li>法律义务的履行与法院/监管要求的配合。</li>
					</ul>
				</section>

				<section>
					<h2>四、信息共享与披露</h2>
					<p>在下列情况下，我们可能会共享您的信息：</p>
					<ul>
						<li>与第三方交易所或流动性提供方为完成交易所必须的共享；</li>
						<li>与合规或执法机构合作以遵守法律或法院命令；</li>
						<li>在合并、收购或资产转让情形中，受让方可能获得相关数据；</li>
						<li>经您授权的其他共享。</li>
					</ul>
					<p>我们不会出售您的个人数据。</p>
				</section>

				<section>
					<h2>五、数据存储与跨境传输</h2>
					<p>我们会在必要的范围内将数据存储在我们或第三方服务提供商控制的服务器上，可能包括跨境传输。对跨境传输，我们会采取合理的法律与技术措施保障数据安全。</p>
				</section>

				<section>
					<h2>六、数据安全</h2>
					<p>我们采用行业常见的安全措施（加密、访问控制、日志审计等）来保护数据。但任何网络传输或存储都无法做到绝对安全，您应当妥善保管账户与密钥。</p>
				</section>

				<section>
					<h2>七、数据保留</h2>
					<p>我们会在实现数据收集目的所需的期限内保留个人数据，或按法律法规要求的最低期限保存。到期后，我们将删除或匿名化处理数据。</p>
				</section>
			</div>

			<div v-else-if="locale == 'zh-TW'" class="p-4">
				<section>
					<h2>一、總則</h2>
					<p>歡迎使用 {{ COMPANY_NAME }}（「本公司」、「我們」）。我們重視您的隱私並致力於保護您的個人資訊。請在使用我們的服務前仔細閱讀本隱私政策。</p>
				</section>

				<section>
					<h2>二、我們收集的資訊</h2>
					<ul>
						<li>帳戶資訊：註冊姓名、電子郵件、電話、KYC/身份驗證資料（如適用）；</li>
						<li>交易與資金數據：交易紀錄、訂單、成交明細、資金出入等；</li>
						<li>裝置與日誌資訊：IP、裝置型號、作業系統、瀏覽器、存取日誌；</li>
						<li>Cookie 與追蹤數據：用於登入狀態、偏好設定、效能優化與分析；</li>
						<li>溝通紀錄：客服對話、電子郵件、工單內容。</li>
					</ul>
				</section>

				<section>
					<h2>三、資訊用途</h2>
					<p>我們將資訊用於提供與改進服務、交易執行、風險管理、客服、合規與法律義務的履行等。</p>
				</section>

				<section>
					<h2>四、資訊共享與揭露</h2>
					<p>在必要情況下，我們可能與第三方交易所、流動性提供者或執法/監管機構共享資訊。我們不會出售個人資料。</p>
				</section>

				<section>
					<h2>五、資料儲存與跨境傳輸</h2>
					<p>資料可能存放於我們或第三方服務供應者的伺服器上並可能跨境傳輸。我們會採取合理措施保障資料安全。</p>
				</section>

				<section>
					<h2>六、資料安全與保留</h2>
					<p>採用加密、存取控制與日誌等安全措施；依法保存資料期限後刪除或匿名化處理。</p>
				</section>

				<section>
					<h2>七、使用者權利</h2>
					<p>您有權行使存取、更正、刪除或限制處理等權利，請聯絡 support@example.com。</p>
				</section>

				<section>
					<h2>八、Cookies 與第三方</h2>
					<p>我們使用 Cookie 以提升使用者體驗，您可於瀏覽器設定進行管理。</p>
				</section>

				<section>
					<h2>九、未成年人</h2>
					<p>本服務不提供予未滿18歲使用者。如發現未成年人資訊，我們將依法律處理。</p>
				</section>

				<section>
					<h2>十、政策更新與聯絡方式</h2>
					<p>我們會公告重大變更。聯絡方式：<code>support@example.com</code></p>
				</section>

				<footer class="note">備註：本政策為範本，請依實務與法規調整並諮詢法律專業。</footer>
			</div>

			<div v-else class="p-4">
				<section>
					<h2>1. Introduction</h2>
					<p>
						Welcome to {{ COMPANY_NAME }} ("we", "us", "the Company"). We respect your privacy and are committed to protecting your personal information. Please read this Privacy Policy carefully
						before using our services.
					</p>
				</section>

				<section>
					<h2>2. Information We Collect</h2>
					<p>We may collect and process the following categories of information:</p>
					<ul>
						<li>Account information: name, email, phone, KYC/identity documents (as applicable);</li>
						<li>Trading and financial data: orders, trades, transaction history;</li>
						<li>Device & log data: IP address, device model, OS, browser, access logs;</li>
						<li>Cookies & tracking data: for authentication, preferences, analytics;</li>
						<li>Communications: customer support chats, emails, tickets.</li>
					</ul>
				</section>

				<section>
					<h2>3. How We Use Information</h2>
					<p>
						We use the information to provide, operate and improve our services, perform trades and settlements, manage risks and compliance (including AML and sanctions screening), provide customer
						support, and comply with legal obligations.
					</p>
				</section>

				<section>
					<h2>4. Information Sharing & Disclosure</h2>
					<p>We may share information with third-party exchanges, liquidity providers, service providers, or law enforcement/regulatory bodies when required. We do not sell your personal data.</p>
				</section>

				<section>
					<h2>5. Data Storage & Cross-Border Transfer</h2>
					<p>
						Data may be stored on servers controlled by us or our service providers and may be transferred across borders. We take reasonable legal and technical safeguards for cross-border transfers.
					</p>
				</section>

				<section>
					<h2>6. Data Security</h2>
					<p>We implement industry-standard security measures (encryption, access control, logging). However, no system is completely secure; protect your account credentials and keys.</p>
				</section>

				<section>
					<h2>7. Data Retention</h2>
					<p>We retain personal data for as long as necessary to fulfill the purposes and to meet legal requirements. Expired data will be deleted or anonymized.</p>
				</section>

				<section>
					<h2>8. Your Rights</h2>
					<p>Where applicable law grants you rights, you may access, correct, delete, or restrict processing of your personal data. To exercise these rights, contact us as below.</p>
				</section>

				<section>
					<h2>9. Cookies & Third-Party Tracking</h2>
					<p>We use cookies and similar technologies for functionality and analytics. You can manage cookie preferences through your browser settings.</p>
				</section>

				<section>
					<h2>10. Minors</h2>
					<p>Our services are not directed to individuals under 18. If we learn that we have collected personal data from a minor, we will take steps to delete such information where required.</p>
				</section>

				<section>
					<h2>11. Policy Updates</h2>
					<p>We may update this Privacy Policy from time to time. Material changes will be posted prominently and, where required, we will seek consent.</p>
				</section>

				<section>
					<h2>12. Contact</h2>
					<p>If you have questions or wish to exercise your data rights, contact us at: <br /><code>support@example.com</code></p>
				</section>

				<footer class="note">Note: This template is for reference only. Please tailor to your operations and applicable laws, and consult legal counsel.</footer>
			</div>
		</ScrollBar>
	</div>
</template>
