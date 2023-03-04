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
		await moveToNextPage(page, groupInfo.nextIdentifier);
	}
	return posts;
}

async function moveToNextPage(page: Page, nextBtnClass: string) {
	Logger.trace(`Next button: ${nextBtnClass}`);
	//If a button is needed to change page, use it
	if (nextBtnClass !== "") {
		const nextBtn = await page.$(nextBtnClass);
		const href: string = await nextBtn.$eval("a", (elem) => elem.href);
		Logger.debug(`href: ${href}`);
		await page.goto(href);
		return;
	}
	//Otherwise, scroll down and rescrape
	await page.evaluate(() => {
		window.scrollTo({ top: window.innerHeight });
	});
	await Utility.sleep(100);
	await page.waitForNetworkIdle();
}
