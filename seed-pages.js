import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import seedrandom from 'seedrandom'

const prisma = new PrismaClient()

// Function to generate a random image URL based on a seed
function generateImage(seed) {
	return `https://picsum.photos/seed/${seed}/200` // Generates a unique image for each seed
}

// Function to generate random pages with a unique image per page
async function generateRandomPages(seed = 'default-seed') {
	const rng = seedrandom(seed)

	for (let i = 0; i < 500; i++) {
		const randomSeed = Math.floor(rng() * 10000) // Create a random seed for each image
		const randomImage = generateImage(randomSeed) // Generate a unique image URL

		// Create a page entry
		await prisma.page.create({
			data: {
				id: uuidv4(), // Generate a unique ID
				name: `Page #${i + 1}`, // Name field as per the schema
				order: i, // Order field as per the schema
				content: JSON.stringify({
					title: `Page #${i + 1}`,
					description: `This is a randomly generated page with ID: ${i + 1}`,
					image: randomImage // Unique image per page
				}) // Store JSON as a string for the content field
			}
		})

		console.log(`Page ${i + 1} created with image: ${randomImage}`)
	}

	console.log('500 pages have been generated.')
}

// Run the script
generateRandomPages()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
