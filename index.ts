import puppeteer from "puppeteer";
import { Website } from "./Types/Website";
import { ScrapeReddit } from "./Scrapers/scrapeReddit";
import { Post } from "./Types/Post";
import { CreateDataSetFromPost } from "./createData";
import { Logger } from "./Utility/logging";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import fetch from "cross-fetch";
import * as Adblock from "./Utility/adBlock/adblock";

async function start() {
	Logger.SetLoglevel();

	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();
	const websites = await LoadWebsites();

	const adblockList = await Adblock.getLists();

	const blocker = await PuppeteerBlocker.fromLists(fetch, adblockList);
	await blocker.enableBlockingInPage(page);
	Adblock.logging(blocker);

	for (let website of websites) {
		await page.goto(website.url);

		const posts: Post[] = [];

		switch (website.group) {
			case "Reddit": {
				posts.push(...(await ScrapeReddit(page, website.nrOfPages)));
				break;
			}
		}
		await CreateDataSetFromPost(posts, page, website);
	}
	await browser.close();
}

async function LoadWebsites(): Promise<Website[]> {
	const data = await import("./websites.json");
	return data.default.map((website) => ({
		url: website.url,
		group: website.group,
		weight: website.weight,
		nrOfPages: website.nrOfPages,
	}));
}

start();
