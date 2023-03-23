import { PrismaClient } from '@prisma/client'
import { Website } from '../Types/Website'
import { WebsiteGroupInfo } from '../Types/WebsiteGroupInfo'
import { Logger } from '../Utility/logging'

const prisma = new PrismaClient()

/// Get all websites with nrOfPages > 0
export async function getActiveWebsites(): Promise<Website[]> {
    return await prisma.website.findMany({
        where: {
            nrOfPages: {
                gt: 0
            }
        }
    })
}

/// Get all websites
export async function getWebsites(): Promise<Website[]> {
    return await prisma.website.findMany()
}

/// Update a website
export async function updateWebsite(website: Website) {
    return await prisma.website.update({
        where: {
            id: website.id
        },
        data: {
            nrOfPages: website.nrOfPages,
            weight: website.weight
        }
    });
}

/// Deactivate a website
export async function deactivateWebsite(id: number) {
    return await prisma.website.update({
        where: {
            id: id
        },
        data: {
            nrOfPages: 0
        }
    });
}

/// Get a website by id
export async function getWebsite(id: number): Promise<Website> {
    return await prisma.website.findUnique({
        where: {
            id: id
        }
    });
}

/// Add a website
export async function addWebsite(website: Website) {
    const existingWebsite = await prisma.website.findUnique({
        where: {
            url: website.url
        }
    });
    if (existingWebsite) {
        Logger.warn(`Website already added URL: ${website.url}`);
        return;
    }
    const group = getGroup(website.url);
    if (group === "") return
    await prisma.website.create({
        data: {
            url: website.url,
            group: group,
            weight: website.weight,
            nrOfPages: website.nrOfPages
        }
    });
}

/// Get all website group info
export async function getWebsiteGroupInfo(): Promise<WebsiteGroupInfo[]> {
    return await prisma.websiteGroupInfo.findMany();
}

function getGroup(url: string) {
    if (url.includes("old.reddit")) return "OldReddit";
    else if (url.includes("reddit")) return "Reddit";
    Logger.warn("URL does not contain a valid group");
    return "";
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