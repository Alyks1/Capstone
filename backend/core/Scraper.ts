import { Post } from "./Types/Post";
import { Page } from "puppeteer";
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
		if (i === pages - 1) break;
		const wasSuccessfull = await moveToNextPageSuccessful(page, groupInfo, i);
		if (!wasSuccessfull) {
			Logger.warn("[Scraper.ts, 59] Moving to next page unsuccessful")
			break;
		}
		Logger.info("Moving to next page")
	}
	return posts;
}

async function moveToNextPageSuccessful(page: Page, groupInfo: WebsiteGroupInfo, index: number) {
	Logger.debug("Moving to next page")
	//Store NextIdentifier as a list  (comma separated values)
	const nextBtnFlow = groupInfo.nextIdentifier.split(",");
	//Go through the list on chronological order to find the next page
	if (nextBtnFlow.length > 0) {
		//Get the root element ie the first element in the list
		const root = await page.$(nextBtnFlow.pop());
		for (var element in nextBtnFlow) {
			element = evaluateElement(element, index);
			element = await getElementWithInteralID(element, page);
			await page.click(element);
		}
		Logger.info("Should be at next page")
		return true;
	}
	//Otherwise, scroll down and rescrape
	await page.evaluate(() => {
		window.scrollTo({ top: window.innerHeight });
	});
	try {
		await page.waitForNetworkIdle({idleTime: 100, timeout: 30000});
	} catch (error) {
		Logger.warn(`[Scraper.ts, 99] ${error}`);
		return false;
	}
}

function evaluateElement(element: string, index: number) {
	if (element.includes("{N}")) {
		const i = index + 1;
		element = element.replace("{N}", i.toString());
	}
	return element;
}

async function getElementWithInteralID(element: string, page: Page) {
	if (element.includes("{ID#")) {
		const i = element.indexOf("{ID#");
		const j = element.indexOf("}");
		const id = element.substring(i + 4, j);
		element = element.replace("{ID#" + id + "}", "");
		//element is li
		const liElements = await page.$$(element);
		for (let liElement of liElements) {
			const liText = await liElement.$eval("a", (e) => e.innerHTML);
			if (liText.includes(id)) {
				return liElement;
			}
		}
		
	}
}