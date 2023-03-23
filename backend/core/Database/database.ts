import { PrismaClient } from '@prisma/client'
import { Website } from '../Types/Website'

const prisma = new PrismaClient()

async function db() {
    
}

/// Get all websites with nrOfPages > 0
async function getActiveWebsites(): Promise<Website> {
    return await prisma.website.findMany({
        where: {
            nrOfPages: {
                gt: 0
            }
        }
    })
}

/// Update a website
async function updateWebsite(website: Website) {
    return await prisma.website.update({
        where: {
            id: website.id
        },
        data: {
            nrOfPages: website.nrOfPages,
            weight: website.weight
        }
    })
}

/// Deactivate a website
async function deactivateWebsite(id: number) {
    return await prisma.website.update({
        where: {
            id: id
        },
        data: {
            nrOfPages: 0
        }
    })
}

/// Get a website by id
async function getWebsite(id: number): Promise<Website> {
    return await prisma.website.findUnique({
        where: {
            id: id
        }
    })
}

/// Add a website
async function addWebsite(website: Website) {
    return await prisma.website.create({
        data: {
            url: website.url,
            group: website.group,
            weight: website.weight,
            nrOfPages: website.nrOfPages
        }
    })
}

db()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })