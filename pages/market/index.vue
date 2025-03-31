<template>
	<div class="w-full h-full">
		<SplitContainer>
			<template #left>
				<SymbolSearch />
			</template>
			<template #right>
				<SplitRowContainer>
					<template #up>
						<KlineHeader />
					</template>
					<template #down>
						<div class="flex flex-col justify-between w-full h-full">
                            <div class="flex-1"><KlineChart/></div>
                            <div><KlineFooter /></div>
						</div>
					</template>
				</SplitRowContainer>
			</template>
		</SplitContainer>
	</div>
</template>
