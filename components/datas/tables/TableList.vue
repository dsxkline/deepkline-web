<script setup lang="ts">
import { useSymbolStore } from '~/store/symbol';

	const datas = ref([{}, {}, {}, {}, {}, {}, {}, {}])
</script>
<template>
	<div class="py-2">
		<ul class="*:py-2">
			<template v-for="item in datas">
				<li>
                    <div>
                        <SymbolName :symbol="useSymbolStore().getActiveSymbol()" :volume="true"/>
                    </div>
                </li>
			</template>
		</ul>
	</div>
</template>
