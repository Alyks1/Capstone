import { Post } from "./Types/Post";
import { Page } from "puppeteer";
import { Logger } from "./Utility/logging";
import { WebsiteGroupInfo } from "./Types/WebsiteGroupInfo";
import { Utility } from "./Utility/utility";

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
		try {
			await page.waitForSelector(groupInfo.rootDiv);
		} catch (error) {
			Logger.warn(`[Scraper.ts, 22] ${error}`);
			break;
		}

		const root = (await page.$$(groupInfo.rootDiv))[0];
		//Get elements branching off the root
		const postElements = await root.$$(groupInfo.divIdentifier);
		//Go through each element and find the correct classes to scrape
		for (const postElement of postElements) {
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
			if (!allPosts.has(text))
				posts.push({ text: text, imgSrc: imgSrc, date: "", trust: 0 });
			allPosts.add(text);
		}
		Logger.trace(allPosts.size);
		Logger.debug(`Scraped Posts: ${posts.length}`);
		if (i === pages - 1) break;
		const wasSuccessfull = await moveToNextPageSuccessful(page, groupInfo, i);
		if (!wasSuccessfull) {
			Logger.warn("[Scraper.ts, 61] Moving to next page unsuccessful");
			break;
		}
	}
	return posts;
}

async function moveToNextPageSuccessful(
	page: Page,
	groupInfo: WebsiteGroupInfo,
	index: number,
) {
	Logger.trace("Moving to next page");
	const rawNextBtnFlow = groupInfo.nextIdentifier.split(",");
	const nextBtnFlow = rawNextBtnFlow.filter((e) => e !== "");
	//Go through the list on chronological order to find the next page
	if (nextBtnFlow.length > 0) {
		for (let element of nextBtnFlow) {
			element = replaceNthWithIndex(element, index, true);
			if (element.includes("{ID#"))
				element = await getElementSelectorWithInteralID(element, page);

			if (element === "Error") return false;
			Logger.trace(`Clicking "${element} > a"`);
			await page.click(`${element} > a`);
			await Utility.sleep(1000);
		}
	} else {
		//Otherwise, scroll down and rescrape
		await page.evaluate(() => {
			window.scrollTo({ top: window.innerHeight });
		});
		try {
			await page.waitForNetworkIdle({ idleTime: 100, timeout: 30000 });
		} catch (error) {
			Logger.warn(`[Scraper.ts, 95] ${error}`);
			return false;
		}
	}
	return true;
}

function replaceNthWithIndex(
	element: string,
	index: number,
	ignoreFirstPage = false,
) {
	let firstPage = 0;
	//Option to ignore the first page as it gets scraped immediately
	if (ignoreFirstPage) firstPage = 1;
	if (element.includes("{N}")) {
		const i = index + 1 + firstPage;
		element = element.replace("{N}", i.toString());
	}
	return element;
}

async function getElementSelectorWithInteralID(element: string, page: Page) {
	const i = element.indexOf("{ID#");
	const j = element.indexOf("}");
	const id = element.substring(i + 4, j);
	const cleanElement = element.replace(`{ID#${id}}`, "");
	//element is li
	const liElements = await page.$$(cleanElement);
	for (const [i, liElement] of liElements.entries()) {
		const liText = await liElement.$eval("a", (e) => e.innerHTML);
		if (liText.includes(id)) {
			return element.replace(`{ID#${id}}`, `:nth-child(${i + 1})`);
		}
	}
	Logger.warn(`[Scraper.ts, 130] Could not find li with innerHTML ${id}`);
	return "Error";
}
