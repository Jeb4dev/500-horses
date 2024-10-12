import { PrismaClient } from '@prisma/client'
import { json } from '@sveltejs/kit'
const prisma = new PrismaClient()

export async function POST({ request }) {
	try {
		const { id, name } = await request.json()

		// Basic validation
		if (!id || !name) {
			return json({ error: 'User ID and name are required' }, { status: 400 })
		}

		// Sanitize the name on the server to prevent SQL injection
		const sanitizedUserName = name.replace(/[^a-zA-Z0-9\s-_]/g, '')

		// Check if the user already exists in the DB
		const existingUser = await prisma.user.findUnique({
			where: { id }
		})

		if (existingUser) {
			return json({ message: 'User already exists' }, { status: 200 })
		}

		// If the user doesn't exist, create the user
		const newUser = await prisma.user.create({
			data: {
				id,
				name: sanitizedUserName
			}
		})

		return json({ message: 'User created successfully', userCreated: true }, { status: 201 })
	} catch (error) {
		console.error('Error creating user:', error)
		return json({ error: 'Database error' }, { status: 500 })
	}
}
