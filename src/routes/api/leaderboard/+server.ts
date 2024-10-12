// src/routes/api/leaderboard/+server.ts
import { PrismaClient } from '@prisma/client'
import { json } from '@sveltejs/kit'

const prisma = new PrismaClient()

export async function GET() {
	try {
		// Fetch all users with a count of how many pages they have found
		const leaderboard = await prisma.user.findMany({
			include: {
				_count: {
					select: { userPages: true } // Count the number of pages each user has found
				}
			},
			orderBy: {
				userPages: { _count: 'desc' } // Sort by the number of pages found (descending)
			}
		})

		// Map the result to return the user name and the count of pages found
		const leaderboardData = leaderboard.map((user) => ({
			name: user.name,
			pagesFound: user._count.userPages
		}))

		return json(leaderboardData)
	} catch (error) {
		console.error('Error fetching leaderboard data:', error)
		return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
	}
}
