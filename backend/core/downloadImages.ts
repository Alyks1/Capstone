import { join } from "path";
import { Logger } from "./Utility/logging";
import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export async function downloadImages(page: Page, posts: Post[]) {
	Logger.info(`Downloading images from ${posts.length} posts`);
	for (const post of posts) {
		const response = await page.goto(post.imgSrc);
		const imageBuffer = await response.buffer();
		const date = post.data.date;
		for (let i = 0; i < post.data.trust; i++) {
			const id = uuidv4().toString();
			const fileName = join(__dirname, `Images/${date}_${id}.jpg`);
			await fs.promises.writeFile(fileName, imageBuffer);
		}
	}
}
