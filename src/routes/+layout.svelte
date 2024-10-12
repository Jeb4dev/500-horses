<script lang="ts">
	// Import your existing CSS and components
	import '../app.css'
	import { ModeWatcher } from 'mode-watcher'
	import { Toaster } from '$lib/components/ui/sonner'
	import Metadata from '$lib/components/metadata.svelte'

	// Import the persistent user store and inventory initialization
	import { user } from '$lib/stores/user' // Import the new user store with id and name
	import { initializeInventory } from '$lib/stores/storage' // Import the initializeInventory function

	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import Loading from '$lib/components/Loading.svelte' // To manage loading state

	// Reactive variables for user ID and user name
	let userId: string | null = null
	let userName: string | null = null

	// Reactive loading state to indicate when inventory is ready
	let inventoryReady = writable(false)

	// Runs after the layout component is mounted (browser-only)
	onMount(async () => {
		// Subscribe to the user store to get the current user object (id and name)
		const unsubscribe = user.subscribe(async (value) => {
			if (value) {
				// If user exists, get the userId and userName from the store
				userId = value.id
				userName = value.name

				// If userId is available, initialize the inventory store with the user's found pages
				if (userId) {
					await initializeInventory(userId) // Await the initialization of inventory
					inventoryReady.set(true) // Mark inventory as ready
				}
			}
		})

		// Cleanup subscription when component is destroyed
		return () => {
			unsubscribe()
		}
	})
</script>

<!-- UI components for layout -->
<ModeWatcher />
<Metadata />
<Toaster />

<!-- Main Layout Wrapper -->
{#if $inventoryReady}
	<!-- Only render this when inventory is ready -->
	<div
		class="bg-background relative flex flex-col items-center mx-auto min-h-screen max-w-7xl"
		id="page"
		data-vaul-drawer-wrapper
	>
		<!-- Header with navigation links -->
		<div
			class="flex flex-col sm:flex-row gap-4 justify-between items-center w-full bg-secondary p-4 px-6"
		>
			<a href="/" class="text-foreground text-lg font-bold">500 Horses</a>
			<div class="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
				<a href="/hall-of-fame" class="text-foreground text-lg hover:underline">Hall of Fame</a>
				<a href="/about" class="text-foreground text-lg hover:underline">About</a>
				<p class="hidden">ID: {userId}</p>
				<p class="text-foreground text-lg">Oon tää <i>{userName}</i></p>
			</div>
		</div>
		<!-- Page content will be injected here -->
		<slot />
	</div>
{:else}
	<Loading />
{/if}
