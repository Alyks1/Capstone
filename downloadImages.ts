import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const fs = require("fs");

async function downloadImages(page: Page, posts: Post[]) {
	for (const post of posts) {
		page.on("response", async (response) => {
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
		await page.goto(post.imgSrc);
	}
}
