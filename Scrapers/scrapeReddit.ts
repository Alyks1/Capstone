import { Post } from "../Types/Post";
import { ElementHandle, Page } from "puppeteer";
import { Utility } from "../Utility/utility";
import { Logger } from "../Utility/logging";

export async function ScrapeReddit(page: Page, pages: number) {
	Logger.info(`Scraping ${pages} Reddit pages`);

	if (pages === 0) return [];

	//First get the root
	const rootDivClass = ".rpBJOHq2PR60pnwJlUyP0";

	await page.waitForSelector(rootDivClass);
	const root = (await page.$$(rootDivClass))[0];
	//Then get all the posts branching off of the root

	const allPostElements: ElementHandle<Element>[] = [];

	for (let i = 0; i < pages; i++) {
		await page.evaluate(() => {
			//10 Posts are retrieved if amount == 1
			window.scrollTo({ top: window.innerHeight });
		});
		await Utility.sleep(100);
		await page.waitForNetworkIdle();
	}

	const postElements = await root.$$("._1poyrkZ7g36PawDueRza-J");
	allPostElements.push(...postElements);

	const posts: Post[] = [];
	for (let postElement of allPostElements) {
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
			console.log("skipping..");
			continue;
		}

		posts.push({ text: text, imgSrc: imgSrc });
	}

	return posts;
}
