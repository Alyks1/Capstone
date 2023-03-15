import { Website } from "../Types/Website";
import { WebsiteGroupInfo } from "../Types/WebsiteGroupInfo";

export async function LoadWebsites(): Promise<Website[]> {
	const data = await import("../../../websites.json");
	return data.default.map((website) => ({
		id: website.id,
		url: website.url,
		group: website.group,
		weight: website.weight,
		nrOfPages: website.nrOfPages,	
	}));
}

export async function LoadWebsiteGroupInfo(): Promise<
	Record<string, WebsiteGroupInfo>
> {
	return (await import("../../../websiteGroupInfo.json")).default;
}
