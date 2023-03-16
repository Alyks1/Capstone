import puppeteer from "puppeteer";
import { Scraper } from "./Scraper";
import { Post } from "./Types/Post";
import { Logger } from "./Utility/logging";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import * as Adblock from "./Utility/adBlock/adblock";
import { getDateFromPost } from "./GenerateData/generateData";
import { createDataset } from "./createDataset";
import { addWebsiteWeight } from "./GenerateData/ProcessData";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { LoadWebsiteGroupInfo, LoadWebsites } from "./Utility/json";

export async function startScraper(
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
) {
	socket.emit("log", "Scraper Started");
	//TODO: Add Unit Test
	//TODO: Add logic to stop trying to scrape before timeout
	//TODO: Add Museum Website to scraper
	const browser = await puppeteer.launch({
		headless: true,
	});
	const page = await browser.newPage();
	const websites = await LoadWebsites();
	const websiteGroupInfos = await LoadWebsiteGroupInfo();

	const adblockList = await Adblock.getLists();

	Logger.trace("Loading adblocker");
	const blocker = await PuppeteerBlocker.fromLists(fetch, adblockList);
	await blocker.enableBlockingInPage(page);
	Adblock.logging(blocker);

	Logger.trace("Loading websites");
	//Set of all texts across websites to remove duplicates
	const alreadyScrapedPosts: Set<string> = new Set<string>();
	const allPosts: Post[] = [];
	for (let website of websites) {
		if (website.nrOfPages === 0) {
			Logger.trace(`Skipping website ${website.url}`);
			continue;
		}

		await page.goto(website.url);

		const websiteGroupInfo = websiteGroupInfos[website.group];
		if (!websiteGroupInfo) {
			Logger.warn(`skipped ${website.url}. GroupInfo undefined`);
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
			websiteGroupInfo,
			alreadyScrapedPosts,
		);

		const processedPosts = getDateFromPost(newPosts);
		const weightedPosts = addWebsiteWeight(processedPosts, website.weight);
		socket.emit("log", "Downloading images");
		allPosts.push(...weightedPosts);
	}

	if (allPosts.length === 0) {
		Logger.warn("No posts found");
		socket.emit("NoPostsFound");
		return;
	}
	await createDataset(page, allPosts);

	socket.emit("log", "Scraper Finished");

	socket.emit("sendDatasetUrl", "/dataset.tar.gz");
	await browser.close();
}
