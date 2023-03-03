import puppeteer from "puppeteer";
import { Website } from "./Types/Website";
import { WebsiteGroupInfo } from "./Types/WebsiteGroupInfo";
import { Scraper } from "./Scraper";
import { Post } from "./Types/Post";
import { CreateDataSetFromPost } from "./createData";
import { Logger } from "./Utility/logging";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import fetch from "cross-fetch";
import * as Adblock from "./Utility/adBlock/adblock";
import { generateDataFromPost } from "./GenerateData/generateData";

async function start() {
	Logger.SetLoglevel();

	const browser = await puppeteer.launch({
		headless: true,
	});
	const page = await browser.newPage();
	const websites = await LoadWebsites();
	const websiteGroupInfos = await LoadWebsiteGroupInfo();

	const adblockList = await Adblock.getLists();

	const blocker = await PuppeteerBlocker.fromLists(fetch, adblockList);
	await blocker.enableBlockingInPage(page);
	Adblock.logging(blocker);

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

		const posts: Post[] = [];
		Logger.info(`Scraping ${website.nrOfPages} ${website.group} pages`);
		posts.push(...(await Scraper(page, website.nrOfPages, websiteGroupInfo)));
		//await CreateDataSetFromPost(posts, page, website);
		generateDataFromPost(posts, page, website);
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

async function LoadWebsiteGroupInfo(): Promise<
	Record<string, WebsiteGroupInfo>
> {
	return (await import("./websiteGroupInfo.json")).default;
}

start();
