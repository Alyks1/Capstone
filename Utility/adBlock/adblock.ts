import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import { Logger } from "../logging";

interface JsonObject {
	content?: string;
	updateAfter?: number;
	contentURL?: string[];
	cdnURLs?: string[];
}

export async function getLists() {
	const data = await import("./adblockAssets.json");
	const allURLs: string[] = [];

	for (const [_, value] of Object.entries(data)) {
		const list: string = (value as JsonObject)?.cdnURLs?.[0];
		allURLs.push(list);
	}

	return allURLs.filter((x) => x);
}

export async function logging(blocker: PuppeteerBlocker) {
	blocker.on("request-blocked", (request: Request) => {
		Logger.blocking(`blocked: ${request.url}`);
	});

	blocker.on("request-redirected", (request: Request) => {
		Logger.blocking(`redirected: ${request.url}`);
	});

	blocker.on("request-whitelisted", (request: Request) => {
		Logger.blocking(`whitelisted: ${request.url}`);
	});

	blocker.on("csp-injected", (request: Request) => {
		Logger.blocking(`csp: ${request.url}`);
	});

	blocker.on("script-injected", (script: string, url: string) => {
		Logger.blocking(`script: ${script.length} Url: ${url}`);
	});

	blocker.on("style-injected", (style: string, url: string) => {
		Logger.blocking(`style: ${style.length} Url: ${url}`);
	});
}
