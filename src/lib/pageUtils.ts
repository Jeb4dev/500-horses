// src/lib/pageUtils.ts
import { inventory } from '$lib/stores/storage'

export async function markPageAsFound(pageId: string, userMessage: string | null) {
	const user = localStorage.getItem('user')

	if (!user) {
		console.error('User is not logged in or available')
		return
	}

	const userObject = JSON.parse(user)
	const userId = userObject.id

	try {
		// Send a POST request to mark the page as found with an optional message
		const response = await fetch('/api/userpages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId, pageId, userMessage })
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('Failed to mark page as found:', errorData)
			return
		}

		const responseData = await response.json()
		console.log('Page successfully marked as found:', responseData)

		// Update the local inventory
		inventory.update((items) => [...items, pageId])
	} catch (error) {
		console.error('Error marking page as found:', error)
	}
}

export async function saveMessage(pageId: string, message: string) {
	const user = localStorage.getItem('user')

	if (!user) {
		console.error('User is not logged in or available')
		return
	}

	const userObject = JSON.parse(user)
	const userId = userObject.id

	try {
		// Send a POST request to save the message associated with the page
		const response = await fetch(`/api/pages/${pageId}/message`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId, message })
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('Failed to save message:', errorData)
			return { ok: false }
		}

		const responseData = await response.json()
		console.log('Message successfully saved:', responseData)
		return { ok: true }
	} catch (error) {
		console.error('Error saving message:', error)
		return { ok: false }
	}
}
