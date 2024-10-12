// src/routes/api/userpages/+server.ts
import { prisma } from '$lib/db'
import { json } from '@sveltejs/kit'

export async function GET({ request }) {
	const userId = request.headers.get('user-id')

	if (!userId) {
		return json({ error: 'User ID is required' }, { status: 400 })
	}

	try {
		// Fetch all pages ordered by the `order` field (ascending order)
		const allPages = await prisma.page.findMany({
			orderBy: { order: 'asc' } // Ensures pages are returned in order (1-500)
		})

		// Fetch the pages the user has found
		const foundPages = await prisma.userPage.findMany({
			where: { userId },
			include: { page: true }
		})

		// Return all pages and the pages found by the user
		return json(
			{
				allPages,
				foundPages: foundPages.map((fp) => fp.page) // Only return the found pages
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Database error:', error)
		return json({ error: 'Database error' }, { status: 500 })
	}
}

export async function POST({ request }) {
	const { userId, pageId } = await request.json()

	if (!userId) {
		console.log('Missing userId')
		return json({ error: 'User ID is required' }, { status: 400 })
	}

	if (!pageId) {
		console.log('Missing pageId')
		return json({ error: 'Page ID is required' }, { status: 400 })
	}

	try {
		// Check if the user exists in the database
		const user = await prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) {
			console.log('User not found:', userId)
			return json({ error: 'User does not exist, cannot create UserPage entry' }, { status: 404 })
		}

		// Check if the page exists in the database
		const page = await prisma.page.findUnique({
			where: { id: pageId }
		})

		if (!page) {
			console.log('Page not found:', pageId)
			return json({ error: 'Page does not exist' }, { status: 404 })
		}

		// Check if the UserPage entry already exists (to avoid duplicates)
		const existingUserPage = await prisma.userPage.findUnique({
			where: {
				userId_pageId: {
					userId,
					pageId
				}
			}
		})

		if (existingUserPage) {
			console.log('UserPage entry already exists for userId:', userId, 'pageId:', pageId)
			return json({ error: 'UserPage entry already exists' }, { status: 400 })
		}

		// Log to check if the function gets here
		console.log('Creating new UserPage entry for userId:', userId, 'pageId:', pageId)

		// Create the UserPage entry
		const userPage = await prisma.userPage.create({
			data: {
				userId,
				pageId
			}
		})

		// Log the created entry
		console.log('UserPage created:', userPage)

		return json({ userPage }, { status: 201 })
	} catch (error) {
		console.error('Database error:', error)
		return json({ error: 'Database error' }, { status: 500 })
	}
}
