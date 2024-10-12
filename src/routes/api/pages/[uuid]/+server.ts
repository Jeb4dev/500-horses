// src/routes/api/pages/[uuid].ts
import { PrismaClient } from '@prisma/client'
import { json } from '@sveltejs/kit'

const prisma = new PrismaClient()

export async function GET({ params, request }) {
	const { uuid } = params
	const userId = request.headers.get('user-id') // Assuming user-id is passed in the headers

	if (!uuid || !userId) {
		return new Response(JSON.stringify({ error: 'Page ID and User ID are required' }), {
			status: 400
		})
	}

	try {
		// Fetch the specific page by its UUID, including user details and messages
		const page = await prisma.page.findUnique({
			where: { id: uuid },
			include: {
				userPages: {
					include: {
						user: true // Include the user details for each entry in UserPage
					}
				}
			}
		})

		if (!page) {
			return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 })
		}

		// Calculate the view count (number of unique users who have found the page)
		const viewCount = page.userPages.length

		// Return the page data along with the list of users who found it and their messages
		return json({
			page: {
				id: page.id,
				name: page.name,
				content: page.content,
				viewCount, // Number of users who viewed this page
				foundAt: page.userPages.find((up) => up.userId === userId)?.foundAt || null, // When the current user found the page
				usersFound: page.userPages.map((up) => ({
					name: up.user.name, // Each user's name
					foundAt: up.foundAt, // When each user found the page
					message: up.message || null // The message left by the user, if any
				}))
			}
		})
	} catch (error) {
		console.error('Error fetching page data:', error)
		return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
	}
}
