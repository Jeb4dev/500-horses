<script lang="ts">
	export let position: string
	export let posNum: number
</script>

<div class="relative w-32 h-32">
	<!-- Hexagon shape with border -->
	<div class="absolute inset-0 flex justify-center items-center">
		<!-- Border hexagon -->
		<div
			class="relative w-full h-full clip-hexagon-border bg-gradient-to-r from-gray-300 to-gray-500"
		>
			<!-- Inner hexagon shape -->
			<div
				class="absolute inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex flex-col items-center justify-center clip-hexagon shadow-lg"
			>
				<!-- Position number (large text) -->
				<span class="text-3xl font-bold">{posNum}</span>
				<!-- Position label (small text) -->
				<span class="text-xs uppercase tracking-wide mt-1">{position}</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* Outer hexagon for the border */
	.clip-hexagon-border {
		clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
	}

	/* Inner hexagon (content) */
	.clip-hexagon {
		clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
	}
</style>
