import { Post } from "./Types/Post";
import { Page } from "puppeteer";
import { Logger } from "./Utility/logging";
import { WebsiteGroupInfo } from "./Types/WebsiteGroupInfo";
import { WorkingData } from "./Types/WorkingData";
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
			Logger.warn(`[Scraper.ts, 21] ${error}`);
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
		if (i === pages - 1) break;
		const wasSuccessfull = await moveToNextPageSuccessful(page, groupInfo, i);
		if (!wasSuccessfull) {
			Logger.warn("[Scraper.ts, 59] Moving to next page unsuccessful");
			break;
		}
		Logger.info(`Scraped Posts: ${posts.length}`);
		Logger.info("Moving to next page");
	}
	return posts;
}

async function moveToNextPageSuccessful(
	page: Page,
	groupInfo: WebsiteGroupInfo,
	index: number,
) {
	Logger.debug("Moving to next page");
	//Store NextIdentifier as a list  (comma separated values)
	const nextBtnFlow = groupInfo.nextIdentifier.split(",");
	Logger.info(`Next button flow ${JSON.stringify(nextBtnFlow)}`);
	//Go through the list on chronological order to find the next page
	if (nextBtnFlow.length > 0) {
		//Get the root element ie the first element in the list
		//const root = await page.$(nextBtnFlow.pop());
		for (let element of nextBtnFlow) {
			Logger.info(`Evaluating ${element}`);
			element = evaluateElement(element, index);
			if (element.includes("{ID#"))
				element = await getElementWithInteralID(element, page);

			Logger.info(`Clicking ${element}`);
			await page.click(`${element} > a`);
			await Utility.sleep(10000);
		}
		Logger.info("Should be at next page");
	} else {
		//Otherwise, scroll down and rescrape
		await page.evaluate(() => {
			window.scrollTo({ top: window.innerHeight });
		});
		try {
			await page.waitForNetworkIdle({ idleTime: 100, timeout: 30000 });
		} catch (error) {
			Logger.warn(`[Scraper.ts, 96] ${error}`);
			return false;
		}
	}
	return true;
}

function evaluateElement(element: string, index: number) {
	if (element.includes("{N}")) {
		const i = index + 1;
		element = element.replace("{N}", i.toString());
	}
	return element;
}

async function getElementWithInteralID(element: string, page: Page) {
	const i = element.indexOf("{ID#");
	const j = element.indexOf("}");
	const id = element.substring(i + 4, j);
	const cleanElement = element.replace(`{ID#${id}}`, "");
	//element is li
	Logger.info(`clean ${cleanElement}`);
	const liElements = await page.$$(cleanElement);
	Logger.info(`liElements ${JSON.stringify(liElements)}`);
	for (const [i, liElement] of liElements.entries()) {
		const liText = await liElement.$eval("a", (e) => e.innerHTML);
		Logger.info(`liText ${liText}`);
		if (liText.includes(id)) {
			const result = element.replace(`{ID#${id}}`, `:nth-child(${i + 1})`);
			Logger.info(`Result ${result}`);
			return result;
		}
	}
	Logger.warn(`[Scraper.ts, 122] Could not find li with innerHTML ${id}`);
}
