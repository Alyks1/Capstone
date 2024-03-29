import { addWebsiteWeight } from "./GenerateData/processData";
import { ast } from "./GenerateData/abstractSyntaxTree";
import { createDataset } from "./createDataset";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getActiveWebsites } from "./Database/dbWebsite";
import { getWebsiteGroupInfo } from "./Database/dbWebsiteGroupInfo";
import { Logger } from "./Utility/logging";
import { Post } from "./Types/Post";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import { Scraper } from "./scraper";
import { Socket } from "socket.io";
import * as Adblock from "./Utility/adBlock/adblock";
import puppeteer from "puppeteer";

export async function startScraper(
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
) {
	socket.emit("log", "Scraper Started");
	const browser = await getBrowser(true);

	const page = await browser.newPage();
	const websites = await getActiveWebsites();
	const WGIs = await getWebsiteGroupInfo();

	const adblockList = await Adblock.getLists();

	Logger.trace("Loading adblocker");
	const blocker = await PuppeteerBlocker.fromLists(fetch, adblockList);
	await blocker.enableBlockingInPage(page);
	Adblock.logging(blocker);

	Logger.trace("Loading websites");
	//Set of all texts across websites to remove duplicates
	const alreadyScrapedPosts: Set<string> = new Set<string>();
	const allPosts: Post[] = [];
	for (const website of websites) {
		if (website.nrOfPages === 0) {
			Logger.trace(`Skipping website ${website.url}`);
			continue;
		}

		try {
			await page.goto(website.url, { timeout: 0 });
		} catch (e) {
			Logger.warn(`[Index.ts, 47] ${website.url}. ${e}`);
			continue;
		}

		const WGI = WGIs.find((WGI) => WGI.group === website.group);
		if (!WGI) {
			Logger.warn(`skipped ${website.url}. GroupInfo undefined`);
			Logger.debug(`Group: ${website.group} not found in WGIs`);
			Logger.debug(`WGIs: ${WGIs.map((WGI) => WGI.group)}`);
			continue;
		}

		Logger.info(`Scraping ${website.nrOfPages} pages from ${website.url}`);
		socket.emit(
			"log",
			`Scraping ${website.nrOfPages} pages from ${website.url}`,
		);
		const newPosts = await Scraper(
			page,
			website.nrOfPages,
			WGI,
			alreadyScrapedPosts,
		);

		const processedPosts = ast(newPosts);
		const weightedPosts = addWebsiteWeight(processedPosts, website.weight);
		socket.emit("log", "Downloading images");
		allPosts.push(...weightedPosts);
	}

	if (allPosts.length === 0) {
		Logger.warn("No posts found");
		socket.emit("error", "No posts found");
		await browser.close();
		return;
	}
	await createDataset(page, allPosts);
	Logger.info("Finished creating dataset");

	socket.emit("log", "Scraper Finished");
	socket.emit(
		"sendDatasetInfo",
		"/output/dataset.tar.gz,/output/backup/backup.csv",
	);
	await browser.close();
}

/**
 * Creates a browser
 * @param headless is a flag to choose if the browser should be visible
 * @returns
 */
export async function getBrowser(headless: boolean = true) {
	return await puppeteer.launch({
		headless: headless,
	});
}
