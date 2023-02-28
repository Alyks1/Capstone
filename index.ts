import puppeteer from "puppeteer";
import { Website } from "./Types/Website";
import { ScrapeReddit } from "./Scrapers/scrapeReddit";
import { Post } from "./Types/Post";
import { CreateDataSetFromPost } from "./createData";
import { Logger } from "./Utility/logging";

async function start() {
	Logger.SetLoglevel();

	const browser = await puppeteer.launch({
		headless: true,
	});
	const page = await browser.newPage();
	const websites = await LoadWebsites();
	//TODO: Install Addblock https://www.npmjs.com/package/@cliqz/adblocker-puppeteer
	for (let website of websites) {
		await page.goto(website.url);
		var posts: Post[] = [];

		switch (website.group) {
			case "Reddit": {
				posts = await ScrapeReddit(page, website.nrOfPages);
				break;
			}
		}
		await CreateDataSetFromPost(posts, page, website);
	}
	await browser.close();
}

async function LoadWebsites(): Promise<Website[]> {
	const data = await import("./websites.json");
	//Open up website file (Json)
	//parse Json to create object that can be passed to
	//create dictionary of weight, website and
	//Instantiate Query selectors
	return data.default.map((website) => ({
		url: website.url,
		group: website.group,
		weight: website.weight,
		nrOfPages: website.nrOfPages,
	}));
}

start();
