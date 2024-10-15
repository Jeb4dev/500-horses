<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores' // To access the UUID from the route
	import { markPageAsFound, saveMessage } from '$lib/pageUtils' // Utility functions
	import { inventory } from '$lib/stores/storage'
	import { user } from '$lib/stores/user' // Assuming you store the user in a Svelte store
	import { get } from 'svelte/store' // To retrieve store values
	import confetti from 'canvas-confetti'
	import Loading from '$lib/components/Loading.svelte'

	let pageData = null // Page data
	let foundPages = [] // List of found pages
	let foundTimestamp = null // Timestamp of when the user found the page
	let contentParsed = null // Parsed page content
	let userId = null // User ID
	let userName = null // User name
	let isFirstTimeFound = false // Flag to track if the page was found for the first time
	let showMessagePrompt = false // Controls the visibility of the message prompt
	let message = '' // User input message
	let isSubmitting = false // Prevents double submission

	const uuid = $page.params.uuid // Get the UUID from the route

	// Function to trigger confetti effect
	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		})

		setTimeout(() => {
			confetti({
				particleCount: 150,
				spread: 120,
				origin: { x: 0.4, y: 0.6 },
				colors: ['#bb0000', '#ffffff']
			})
		}, 300)

		setTimeout(() => {
			confetti({
				particleCount: 200,
				spread: 100,
				origin: { x: 0.5, y: 0.4 },
				colors: ['#00ff00', '#ff00ff']
			})
		}, 600)

		setTimeout(() => {
			showMessagePrompt = true
		}, 1000)
	}

	// Function to check if the page is already found
	function isPageFound(pageId) {
		return foundPages.includes(pageId) || isFirstTimeFound
	}

	// Fetch the specific page data from the backend
	onMount(async () => {
		// Get the userId and userName from the Svelte store
		const userData = get(user)
		userId = userData?.id
		userName = userData?.name

		if (!userId) {
			console.error('User ID is not available')
			return
		}

		const res = await fetch(`/api/pages/${uuid}`, {
			headers: {
				'user-id': userId
			}
		})

		if (res.ok) {
			const data = await res.json()
			pageData = data.page
			contentParsed = JSON.parse(pageData.content)
			foundPages = get(inventory)

			// If the page is not yet found, mark it as found
			if (!foundPages.includes(uuid)) {
				await markPageAsFound(uuid, '') // Mark as found in the database
				inventory.update((items) => [...items, uuid])
				foundTimestamp = new Date().toLocaleString()
				isFirstTimeFound = true
				pageData.viewCount += 1

				// Add the current user to the list of users who found the page
				pageData.usersFound.push({ name: userName, foundAt: foundTimestamp, message: '' })

				triggerConfetti()
			} else {
				foundTimestamp = pageData.foundAt
			}
		} else {
			console.error('Failed to fetch page data')
		}
	})

	// Function to handle message submission
	async function submitMessage() {
		if (!message.trim() || isSubmitting) return

		isSubmitting = true

		try {
			const res = await saveMessage(uuid, message)
			if (res.ok) {
				showMessagePrompt = false

				// Update the user's message in the usersFound array
				const userFound = pageData.usersFound.find((user) => user.name === userName)
				if (userFound) {
					userFound.message = message
				}

				message = '' // Clear the input

				// Re-fetch the page data to reflect the updated message
				const updatedPageRes = await fetch(`/api/pages/${uuid}`, {
					headers: {
						'user-id': userId // Send the userId in the headers
					}
				})

				if (updatedPageRes.ok) {
					const updatedData = await updatedPageRes.json()
					pageData = updatedData.page // Update the pageData with the new data
				}
			}
		} catch (error) {
			console.error('Failed to submit message:', error)
		} finally {
			isSubmitting = false
		}
	}
</script>

<!-- Page Display -->
<div class="w-full">
	{#if pageData && contentParsed}
		{#if isPageFound(pageData.id)}
			{#if contentParsed.iframe}
				<div class="aspect-w-16 aspect-h-9">
					<iframe src={contentParsed.iframe} class="w-full h-64" allowfullscreen></iframe>
				</div>
			{/if}
			<div class="page-card rounded-lg p-4">
				<img
					src={'/horses/' + uuid + '.png'}
					alt={contentParsed.title}
					class="w-60 h-60 object-cover rounded-lg mb-4 mx-auto"
				/>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white">{contentParsed.title}</h3>
				<p class="text-sm text-gray-700 dark:text-gray-300 mb-4">{contentParsed.description}</p>

				<div class="text-sm text-gray-600 dark:text-gray-400">
					<p>Viewed by: {pageData.viewCount} users</p>
					{#if foundTimestamp}
						<p>You found this page on: {foundTimestamp}</p>
					{/if}
				</div>

				<!-- Display users who found the page -->
				<div class="mt-4">
					<h4 class="font-semibold text-gray-900 dark:text-white">Users who found this page:</h4>
					<ul class="list-disc pl-4 text-sm text-gray-700 dark:text-gray-300">
						{#each pageData.usersFound as user}
							<li>
								<p>{user.name} found it on {new Date(user.foundAt).toLocaleString()}</p>
								{#if user.message}
									<p class="text-gray-500 italic">Message: "{user.message}"</p>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{:else}
			<Loading />
		{/if}
	{:else}
		<Loading />
	{/if}
</div>

<!-- Message Prompt Modal -->
{#if showMessagePrompt}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
		<div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-md">
			<h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Leave a short message</h3>
			<textarea
				bind:value={message}
				class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none"
				placeholder="Your message here..."
				rows="4"
			>
			</textarea>
			<div class="mt-4 flex justify-between">
				<button
					on:click={() => {
						showMessagePrompt = false
						message = ''
					}}
					class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					on:click={submitMessage}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Submitting...' : 'Submit'}
				</button>
			</div>
		</div>
	</div>
{/if}
