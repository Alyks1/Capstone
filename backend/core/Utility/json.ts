import { Website } from "../Types/Website";
import { WebsiteGroupInfo } from "../Types/WebsiteGroupInfo";
import fs from "fs";

//export async function LoadWebsites(): Promise<Website[]> {
//	const data = await import("../../../websites.json");
//	return data.default.map((website) => ({
//		id: website.id,
//		url: website.url,
//		group: website.group,
//		weight: website.weight,
//		nrOfPages: website.nrOfPages,	
//	}));
//}

export async function LoadWebsiteGroupInfo(): Promise<
	Record<string, WebsiteGroupInfo>
> {
	return (await import("../../../websiteGroupInfo.json")).default;
}

export async function LoadWebsites() {
	const data = await fs.promises.readFile("../websites.json");
	const jsonData = JSON.parse(data.toString());
	return jsonData.map((website: Website) => ({
		id: website.id,
		url: website.url,
		group: website.group,
		weight: website.weight,
		nrOfPages: website.nrOfPages,	
	}));
}