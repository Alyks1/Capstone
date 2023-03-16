import { LoadWebsites } from "./Utility/json";
import { Website } from "./Types/Website";
import { Logger } from "./Utility/logging";
import fs from "fs";

export async function addWebsite(w: { website: { url: string; weight: number; nrOfPages: number; }; }) {
	const website = w.website;
	const websites = await LoadWebsites();

	Logger.info(JSON.stringify(website));

	if (websiteAlreadyInJson(websites, website.url)) {
		Logger.warn(`Website already added URL: ${website.url}`);
		return "Website already added";
	}
	if (!isValidUrl(website.url)) {
		Logger.warn(`Invalid URL: ${website.url}`);
		return "Invalid URL";
	}

	const id = websites.length;
	const weight: number = website.weight;
	const nrOfPages: number = website.nrOfPages;
	const group = getGroup(website.url);
	const newWebsite: Website = {
		id: id,
		url: website.url,
		group: group,
		weight: weight,
		nrOfPages: nrOfPages,
	};
	websites.push(newWebsite);

	const jsonText = JSON.stringify(websites, null, 2);
	await fs.promises.writeFile("../websites.json", jsonText);
	return "Website added";
}

function getGroup(url: string) {
	if (url.includes("old.reddit")) return "OldReddit";
	else if (url.includes("reddit")) return "Reddit";
	Logger.warn("URL does not contain a valid group");
	return "";
}

function isValidUrl(url: string) {
	if (getGroup(url) === "") return false;
	return true;
}

function websiteAlreadyInJson(websites: Website[], url: string) {
	return websites.filter((website) => website.url === url).length > 0;
}

export async function updateWebsite(website: { id: number; nrOfPages: number; weight: number; }) {
	Logger.info(JSON.stringify(website));
	const websites = await LoadWebsites();
	const index = websites.findIndex((w) => website.id === w.id);
	if (index === -1) {
		Logger.warn(`Website with id ${website.id} not found`);
	}
	websites[index].nrOfPages = website.nrOfPages;
	websites[index].weight = website.weight;
	const jsonText = JSON.stringify(websites, null, 2);
	await fs.promises.writeFile("../websites.json", jsonText);
}