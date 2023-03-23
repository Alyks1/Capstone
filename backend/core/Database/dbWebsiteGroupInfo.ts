import { WebsiteGroupInfo } from '../Types/WebsiteGroupInfo'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/// Get all website group info
export async function getWebsiteGroupInfo(): Promise<WebsiteGroupInfo[]> {
    return await prisma.websiteGroupInfo.findMany();
}

/**
 * Create website group info
 * ! Only run once and manually
 */
export async function createWebsiteGroupInfo() {
    await prisma.websiteGroupInfo.create({
        data: {
            group: "OldReddit",
            rootDiv: ".sitetable",
            divIdentifier: ".thing",
            textIdentifier: "a.title",
            imgIdentifier: ".thumbnail > img",
            nextIdentifier: ".next-button"
        }
    });
    await prisma.websiteGroupInfo.create({
        data: {
            group: "Reddit",
            rootDiv: ".rpBJOHq2PR60pnwJlUyP0",
            divIdentifier: "._1poyrkZ7g36PawDueRza-J",
            textIdentifier: "._eYtD2XCVieq6emjKBH3m",
            imgIdentifier: ".ImageBox-image",
            nextIdentifier: ""
        }
    });
}