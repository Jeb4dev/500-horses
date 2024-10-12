<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { inventory } from '$lib/stores/storage'
	import { user } from '$lib/stores/user'

	// TypeScript types for pages and found pages
	let allPages: { id: string; name: string; content: string }[] = []
	let foundPages: { id: string }[] = []
	let foundCount: number = 0 // Count of found pages

	// Parsed page contents
	let parsedContents: { [key: string]: { title: string; description: string; image: string } } = {}

	// Fetch data from the backend on component mount
	onMount(async () => {
		// Subscribe to the user store to get the user's ID
		let userId: string | null = null

		// Fetch user ID from the store
		const unsubscribe = user.subscribe((value) => {
			if (value?.id) {
				userId = value.id // Extract userId
			}
		})

		// Cleanup the subscription
		onDestroy(() => {
			unsubscribe()
		})

		// If userId is not available, return
		if (!userId) {
			console.error('User is not logged in.')
			return
		}

		// Fetch user pages data from the backend
		const res = await fetch('/api/userpages', {
			headers: {
				'user-id': userId
			}
		})

		// Handle the response and update local variables
		const data = await res.json()
		allPages = data.allPages // All pages (in order from 1-500)
		foundPages = data.foundPages // Pages the user has found
		foundCount = foundPages.length // Set found count
		inventory.set(foundPages.map((page) => page.id)) // Store found page IDs in the persistent inventory

		// Parse the content of all found pages
		allPages.forEach((page) => {
			if (page.content) {
				try {
					parsedContents[page.id] = JSON.parse(page.content)
				} catch (e) {
					console.error(`Failed to parse content for page ${page.id}:`, e)
				}
			}
		})
	})

	// Check if a page has been found by the user
	function isPageFound(pageId: string) {
		return foundPages.some((page) => page.id === pageId)
	}
</script>

<!-- Top section to show how many pages have been found -->
<div class="text-center my-4">
	<h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
		You have found {foundCount} out of {allPages.length} pages!
	</h2>
</div>

<!-- Display the pages in a responsive grid layout using TailwindCSS -->
<div class="p-4">
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
		{#each allPages as page, index}
			<div
				class="page-card relative rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer"
			>
				{#if isPageFound(page.id)}
					<!-- Show the found page and make it clickable with an image -->
					{#if parsedContents[page.id]}
						<a href={`/${page.id}`} class="text-center block">
							<img
								src={parsedContents[page.id].image}
								alt={parsedContents[page.id].title}
								class="mb-2 w-40 h-40 object-cover rounded-lg mx-auto"
							/>
							<h3 class="text-lg font-bold text-gray-900 dark:text-white">
								{parsedContents[page.id].title}
							</h3>
							<p class="text-sm text-gray-700 dark:text-gray-300 truncate">
								{parsedContents[page.id].description}
							</p>
						</a>
					{:else}
						<p>Failed to load content</p>
					{/if}
				{:else}
					<!-- Show the mystic page for unfound ones -->
					<div class="text-center flex-col justify-center items-center">
						<h3 class="mystic-page text-7xl font-bold text-gray-500 dark:text-gray-400">???</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">Mystery Page</p>
					</div>
				{/if}
				<!-- Show page number in the bottom corner -->
				<span
					class="absolute bottom-2 right-2 text-xs font-semibold text-gray-600 dark:text-gray-400"
					>#{index + 1}</span
				>
			</div>
		{/each}
	</div>
</div>

<!-- Custom styles for mystic/unfound pages -->
<style>
	.mystic-page {
		opacity: 0.5;
		filter: blur(4px);
		cursor: not-allowed;
	}
</style>
