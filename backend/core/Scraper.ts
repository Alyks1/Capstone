import { Post } from "./Types/Post";
import { Page } from "puppeteer";
import { Utility } from "./Utility/utility";
import { Logger } from "./Utility/logging";
import { WebsiteGroupInfo } from "./Types/WebsiteGroupInfo";
import { WorkingData } from "./Types/WorkingData";

export async function Scraper(
	page: Page,
	pages: number,
	groupInfo: WebsiteGroupInfo,
	allPosts: Set<string>,
) {
	const posts: Post[] = [];

	for (let i = 0; i < pages; i++) {
		Logger.trace(`${i} of ${pages} pages`);
		//First get root
		await page.waitForSelector(groupInfo.rootDiv);
		const root = (await page.$$(groupInfo.rootDiv))[0];
		//Get elements branching off the root
		const postElements = await root.$$(groupInfo.divIdentifier);
		//Go through each element and find the correct classes to scrape
		for (let postElement of postElements) {
			const text = await postElement.$eval(
				groupInfo.textIdentifier,
				(t) => t.textContent,
			);
			let imgSrc = "";
			try {
				imgSrc = await postElement.$eval(
					groupInfo.imgIdentifier,
					(i: HTMLImageElement) => i.src,
				);
			} catch (e) {
				Logger.trace("skipping..");
				continue;
			}

			//If the post has not been scraped, push it
			const blankData: WorkingData = {
				date: "",
				trust: 0,
				pos: 0,
			};
			if (!allPosts.has(text))
				posts.push({ text: text, imgSrc: imgSrc, data: blankData });
			allPosts.add(text);
		}
		Logger.debug(allPosts.size);
		const wasSuccessfull = await moveToNextPageSuccessful(page, groupInfo.nextIdentifier);
		if (!wasSuccessfull) {
			break;
		}
	}
	return posts;
}

async function moveToNextPageSuccessful(page: Page, nextBtnClass: string) {
	Logger.trace(`Next button: ${nextBtnClass}`);
	//If a button is needed to change page, use it
	if (nextBtnClass !== "") {
		const nextBtn = await page.$(nextBtnClass);
		const href: string = await nextBtn.$eval("a", (elem) => elem.href);
		Logger.debug(`href: ${href}`);
		await page.goto(href);
		return true;
	}
	//Otherwise, scroll down and rescrape
	const h = await page.evaluate(() => window.innerHeight);
	//TODO: fix innerheight only being 600ish
	await page.evaluate(() => {
		window.scrollTo({ top: window.innerHeight });
	});
	try {
		await page.waitForNetworkIdle({idleTime: 100, timeout: 30000});
	} catch (error) {
		Logger.warn(`[Scraper.ts, 77] ${error}`);
		return false;
	}
}
