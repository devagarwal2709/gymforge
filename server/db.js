// One shared database connection for the whole API.
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()