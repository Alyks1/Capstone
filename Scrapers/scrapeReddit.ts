import { Post } from "../Types/Post";
import { ElementHandle, Page } from "puppeteer";
import { Utility } from "../Utility/utility";
import { Logger } from "../Utility/logging";

const SOME_MAGNITUDE = 3;

export async function ScrapeReddit(page: Page, pages: number) {
	Logger.info(`Scraping ${pages} Reddit pages`);

	if (pages === 0) return [];

	//First get the root
	const rootDivClass = ".rpBJOHq2PR60pnwJlUyP0";

	await page.waitForSelector(rootDivClass);
	const root = (await page.$$(rootDivClass))[0];
	//Then get all the posts branching off of the root

	const posts: Post[] = [];
	const allPosts: Set<string> = new Set<string>();

	for (let i = 0; i < pages; i++) {
		const postElements = await root.$$("._1poyrkZ7g36PawDueRza-J");
		for (let postElement of postElements) {
			const text = await postElement.$eval(
				"._eYtD2XCVieq6emjKBH3m",
				(t) => t.textContent,
			);
			let imgSrc = "";
			try {
				imgSrc = await postElement.$eval(
					".ImageBox-image",
					(i: HTMLImageElement) => i.src,
				);
			} catch (e) {
				Logger.trace("skipping..");
				continue;
			}

			if (!allPosts.has(text)) posts.push({ text: text, imgSrc: imgSrc });
			allPosts.add(text);
		}
		await page.evaluate(() => {
			window.scrollTo({ top: window.innerHeight });
		});
		Logger.info(allPosts.size);
		await Utility.sleep(100);
		await page.waitForNetworkIdle();
	}

	return posts;
}
