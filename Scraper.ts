import { Post } from "./Types/Post";
import { Page } from "puppeteer";
import { Utility } from "./Utility/utility";
import { Logger } from "./Utility/logging";
import { WebsiteGroupInfo } from "./Types/WebsiteGroupInfo";

export async function Scraper(
	page: Page,
	pages: number,
	groupInfo: WebsiteGroupInfo,
) {
	if (pages === 0) return [];

	//First get the root
	const rootDivClass = groupInfo.rootDiv;

	await page.waitForSelector(rootDivClass);
	const root = (await page.$$(rootDivClass))[0];
	//Then get all the posts branching off of the root

	const posts: Post[] = [];
	//TODO: Add Set for all Posts to not process duplicate posts
	const allPosts: Set<string> = new Set<string>();

	for (let i = 0; i < pages; i++) {
		const postElements = await root.$$(groupInfo.divIdentifier);
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

			if (!allPosts.has(text)) posts.push({ text: text, imgSrc: imgSrc });
			allPosts.add(text);
		}
		Logger.info(allPosts.size);
		await moveToNextPage(page, groupInfo.nextIdentifier);
	}

	return posts;
}

async function moveToNextPage(page: Page, nextBtnClass: string) {
	Logger.trace(`Next button: ${nextBtnClass}`);
	if (nextBtnClass !== "") {
		const nextBtn = await page.$(nextBtnClass);
		const href: string = await nextBtn.$eval("a", (elem) => elem.href);
		page.goto(href);
	}
	await page.evaluate(() => {
		window.scrollTo({ top: window.innerHeight });
	});
	await Utility.sleep(100);
	await page.waitForNetworkIdle();
}
