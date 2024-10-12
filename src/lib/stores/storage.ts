// src/lib/stores/storage.ts
import { writable } from 'svelte/store'

// Create a writable store for inventory (pages the user has found)
export const inventory = writable<string[]>([])

// Function to initialize inventory by fetching data from the backend
export async function initializeInventory(userId: string) {
	try {
		const response = await fetch(`/api/userpages`, {
			headers: {
				'user-id': userId
			}
		})

		if (response.ok) {
			const data = await response.json()
			inventory.set(data.foundPages.map((page) => page.id)) // Initialize the store with found pages
		} else {
			console.error('Failed to load inventory from the backend')
		}
	} catch (error) {
		console.error('Error fetching inventory:', error)
	}
}
