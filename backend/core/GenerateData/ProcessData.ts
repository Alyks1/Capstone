import { Post } from "../Types/Post";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";

/**
 * Adds or removes trust based on the number properties.
 *
 * - Numbers between 0 and 100 have decreased trust
 * - Many different numbers have increased trust
 * @param data WorkingData array which to calc trust on
 * @returns
 */
export function calcTrust(data: WorkingData[]) {
	data.forEach((x) => {
		//If the date is not between 0 and 100
		if (+x.date < 0 || +x.date > 101) x.trust++;
		//If many different numbers, more precision
		if (new Set([...x.date]).size === x.date.length) x.trust++;
	});
	if (data.length === 1) data[0].trust + 2;
	return data;
}

/**
 * Filteres data by removing entries with less than 1 trust or dates above 1940
 * @param data data to be filtered
 * @returns
 */
export function filterData(data: WorkingData[]) {
	//If trust is less than 1, remove
	data = data.filter((x) => x.trust >= 1);
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
	Logger.debug(
		posts.map((x) => `\n(${x.data.date.padEnd(7, " ")} : ${x.data.trust})`),
	);
	posts.forEach((x) => {
		x.data.trust = Math.round(x.data.trust * websiteWeight +0.5);
	});
	Logger.info(
		posts.map((x) => `\n(${x.data.date.padEnd(7, " ")} : ${x.data.trust})`),
	);
	return posts;
}
