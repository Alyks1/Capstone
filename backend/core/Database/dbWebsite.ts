import { PrismaClient } from '@prisma/client'
import { Website } from '../Types/Website'
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

function getGroup(url: string) {
    if (url.includes("old.reddit")) return "OldReddit";
    else if (url.includes("reddit")) return "Reddit";
    else if (url.includes("khm")) return "KHMuseum";
    Logger.warn("URL does not contain a valid group");
    return "";
}