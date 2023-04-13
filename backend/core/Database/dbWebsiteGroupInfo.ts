import { WebsiteGroupInfo } from '../Types/WebsiteGroupInfo'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/// Get all website group info
export async function getWebsiteGroupInfo(): Promise<WebsiteGroupInfo[]> {
    var result = await prisma.websiteGroupInfo.findMany();
    if (result.length === 0) {
        await createWebsiteGroupInfo();
        result = await prisma.websiteGroupInfo.findMany();
    }
    return result;
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
    await prisma.websiteGroupInfo.create({
        data: {
            group: "KHMuseum",
            rootDiv: "div.large-9.large-push-3.columns.content",
            divIdentifier: ".object-gallery-item",
            textIdentifier: "p",
            imgIdentifier: ".image > img",
            nextIdentifier: ""
        }
    });
    
}
