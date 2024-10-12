<script lang="ts">
	import { onMount } from 'svelte'

	// Store leaderboard data
	let leaderboard: { name: string; pagesFound: number }[] = []

	// Fetch leaderboard data from the backend
	onMount(async () => {
		const res = await fetch('/api/leaderboard')
		if (res.ok) {
			leaderboard = await res.json()
		} else {
			console.error('Failed to load leaderboard')
		}
	})
</script>

<!-- Hall of Fame Section -->
<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header Section -->
		<h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
			🏆 Hall Of Fame 🏆
		</h1>

		<!-- Leaderboard Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each leaderboard as user, index}
				<!-- Card for Each User -->
				<div
					class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform transition duration-300 hover:scale-105"
				>
					<div class="flex items-center space-x-4">
						<!-- Rank Badge -->
						<div class="text-2xl font-bold text-blue-500 dark:text-yellow-400">
							#{index + 1}
						</div>

						<!-- User Info -->
						<div>
							<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h3>
							<p class="text-gray-500 dark:text-gray-400">{user.pagesFound} pages found</p>
						</div>
					</div>

					<!-- Progress Bar (Optional, just for design) -->
					<div class="mt-4">
						<div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
							<div
								class="bg-blue-500 dark:bg-yellow-400 h-2.5 rounded-full"
								style="width: {Math.min((user.pagesFound / 5) * 100, 100)}%"
							></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
