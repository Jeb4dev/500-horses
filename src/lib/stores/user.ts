import { writable } from 'svelte/store'

// Define the User type
interface User {
	id: string
	name: string
}

function persistentUserStore() {
	const key = 'user' // The key in localStorage
	let initialValue: User | null = null
	let browser = typeof window !== 'undefined'

	// Check localStorage for existing user data if in the browser
	if (browser) {
		const storedUser = localStorage.getItem(key)
		initialValue = storedUser ? JSON.parse(storedUser) : null
	}

	// Create a writable store with the initial value from localStorage (or null)
	const { subscribe, set } = writable<User | null>(initialValue)

	// Function to create a new user ID and store it, with optional name prompt
	const createUser = async () => {
		const userId = crypto.randomUUID() // Generate a unique UUID
		let userName =
			prompt("Type nickname, if you don't want to be 'Anonymous':", 'Anonymous')?.trim() ||
			'Anonymous' // Prompt user for name

		// Sanitize the name to prevent SQL injection by stripping dangerous characters
		userName = userName.replace(/[^a-zA-Z0-9\s-_]/g, '') // Allow only alphanumeric, space, hyphen, underscore

		const newUser: User = { id: userId, name: userName }
		set(newUser) // Set the new user object in the store

		if (browser) {
			localStorage.setItem(key, JSON.stringify(newUser)) // Store user in localStorage
		}

		// Send to backend to check or create the user
		console.log(`Sending user with ID: ${userId} and Name: ${userName} to backend`)
		await checkOrCreateUser(newUser)
	}

	// Function to check if the user exists in the DB, if not, create it
	const checkOrCreateUser = async (user: User) => {
		console.log('Checking/creating user in the backend')
		try {
			const res = await fetch('/api/users/check', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(user) // Send both userId and name
			})

			if (res.ok) {
				const data = await res.json()
				if (data.userCreated) {
					console.log('User created in the database')
				} else {
					console.log('User already exists in the database')
				}
			} else {
				console.error('Error checking/creating user in the backend')
			}
		} catch (error) {
			console.error('Network or backend error:', error)
		}
	}

	// Automatically create a new user if no user exists when the store is initialized
	if (browser && !initialValue) {
		createUser()
	}

	return {
		subscribe,
		createUser
	}
}

// Export the user store
export const user = persistentUserStore()
