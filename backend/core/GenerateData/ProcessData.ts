import { Post } from "../Types/Post";
import { Logger } from "../Utility/logging";

/**
 * Weighs the posts' trust with the website trust to get a final trust
 * @param posts
 * @param websiteWeight
 * @returns
 */
export function addWebsiteWeight(posts: Post[], websiteWeight: number): Post[] {
	posts.forEach((x) => {
		x.trust = Math.round(x.trust * websiteWeight);
		if (x.trust === 0) x.trust = 1;
	});
	Logger.info(posts.map((x) => `\n(${x.date.padEnd(7, " ")} : ${x.trust})`));
	return posts;
}
