import { Post } from "../Types/Post";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";

/**
 * Filteres data by removing entries with less than 1 trust or dates above 1940
 * @param data data to be filtered
 * @returns
 */
export function filterData(data: WorkingData[]) {
	//If trust is less than 1, remove
	data = data.filter((x) => x.trust > 0);
	//If data is above 1940, remove
	data = data.filter((x) => +x.date < 1940);
	return data;
}

/**
 * Choses one entry from the Array with the highest trust
 * @param data WorkingData collection from where to choose the most trusted
 * @returns
 */
export function chooseMostTrusted(data: WorkingData[]) {
	let result: WorkingData = data[0];
	Logger.debug(data.map((x) => `\n(${x.date.padEnd(7, " ")} : ${x.trust})`));
	data.forEach((x) => {
		if (x.trust > result.trust) result = x;
	});
	return result;
}

/**
 * Weighs the posts' trust with the website trust to get a final trust
 * @param posts
 * @param websiteWeight
 * @returns
 */
export function addWebsiteWeight(posts: Post[], websiteWeight: number): Post[] {
	const debugText = `\n Bevor adding Website weight`
	Logger.debug(
		posts.map((x) => `${debugText}(${x.data.date.padEnd(7, " ")} : ${x.data.trust})}`),
	);
	posts.forEach((x) => {
		x.data.trust = Math.round(x.data.trust * websiteWeight);
		if (x.data.trust === 0) x.data.trust = 1;
	});
	Logger.info(
		posts.map((x) => `\n(${x.data.date.padEnd(7, " ")} : ${x.data.trust})`),
	);
	return posts;
}