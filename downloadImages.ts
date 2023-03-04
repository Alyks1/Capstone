import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { Logger } from "./Utility/logging";
import fs from "fs";

export async function downloadImages(page: Page, posts: Post[]) {
	Logger.trace("Downloading images");
	//TODO: Fix this
	for (const post of posts) {
		const id = uuidv4().toString();
		const fileName = `${post.data.date}_${id}`;
		const response = await page.goto(post.imgSrc);
		const imageBuffer = await response.buffer();
		await fs.promises.writeFile(`./Images/${fileName}.jpg`, imageBuffer);
	}
}
