import { PrismaClient } from '@prisma/client'

// Use a global variable to prevent multiple instances of PrismaClient in development
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
	global.prisma = prisma
}

export { prisma }
