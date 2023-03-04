import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { Logger } from "./Utility/logging";
import fs from "fs";

export async function downloadImages(page: Page, posts: Post[]) {
	Logger.trace("Downloading images");
	for (const post of posts) {
		await addListener(page, post);
		await page.goto(post.imgSrc);
		page.removeAllListeners();
	}
}

async function addListener(page: Page, post: Post) {
	await page.on("response", async (response) => {
		if (response.request().resourceType() === "image") {
			response.buffer().then((file) => {
				const id = uuidv4().toString();
				const fileName = `${post.data.date}_${id}`;
				const filePath = path.resolve(`./Images/${fileName}.pdf`);
				const writeStream = fs.createWriteStream(filePath);
				writeStream.write(file);
			});
		}
	});
}
