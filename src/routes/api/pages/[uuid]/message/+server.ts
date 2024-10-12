import { PrismaClient } from '@prisma/client'
import { json } from '@sveltejs/kit'

const prisma = new PrismaClient()

// Basic sanitization function to escape special characters
function sanitizeInput(input: string): string {
	return input.replace(/[&<>"'/]/g, function (char) {
		switch (char) {
			case '&':
				return '&amp;'
			case '<':
				return '&lt;'
			case '>':
				return '&gt;'
			case '"':
				return '&quot;'
			case "'":
				return '&#039;'
			case '/':
				return '&#x2F;'
			default:
				return char
		}
	})
}

export async function POST({ params, request }) {
	const { uuid } = params // Page UUID
	const { userId, message } = await request.json()

	// Sanitize input data
	if (!uuid || !userId || !message) {
		return new Response(JSON.stringify({ error: 'Page ID, User ID, and message are required' }), {
			status: 400
		})
	}

	try {
		const sanitizedMessage = sanitizeInput(message) // Sanitize the message

		// Find the UserPage entry
		const userPage = await prisma.userPage.findUnique({
			where: {
				userId_pageId: {
					// Use composite key (userId, pageId)
					userId,
					pageId: uuid
				}
			}
		})

		if (!userPage) {
			return new Response(JSON.stringify({ error: 'UserPage not found' }), { status: 404 })
		}

		// Update the message in the UserPage record
		const updatedUserPage = await prisma.userPage.update({
			where: {
				userId_pageId: {
					userId,
					pageId: uuid
				}
			},
			data: {
				message: sanitizedMessage // Store the sanitized message
			}
		})

		return json({ success: true, userPage: updatedUserPage })
	} catch (error) {
		console.error('Error saving message:', error)
		return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
	}
}
