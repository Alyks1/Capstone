import { createGzip } from "zlib";
import { join } from "path";
import { Logger } from "./Utility/logging";
import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { stringify } from "csv";
import { v4 as uuidv4 } from "uuid";
import * as tar from "tar";
import fs from "fs";
import writeFile from "write-file-atomic";

const DATASET_PATH = "../frontend/output/dataset";
const RESULT_PATH = "../frontend/output/dataset.tar.gz";

interface CSVType {
	date: string;
	trust: number;
	id: string;
	imgSrc: string;
}

//TODO: Refactor this to be able to get data from csv

/**
 * creates a dataset from the given posts
 * @param page
 * @param posts
 */
export async function createDataset(page: Page, posts: Post[]) {
	Logger.info(`Downloading images from ${posts.length} posts`);

	Logger.trace("Removing Files from previous dataset");
	clearDir();

	const csv: CSVType[] = [];
	for (const post of posts) {
		const response = await page.goto(post.imgSrc);
		const imageBuffer = await response.buffer();
		const date = post.data.date;
		const trust = post.data.trust;
		const src = post.imgSrc;
		const id = uuidv4().toString();
		csv.push({
			id: id,
			date: date,
			trust: trust,
			imgSrc: src,
		});
		const fileName = `${id}.jpg`;
		const filePath = join(`${DATASET_PATH}/`, fileName);
		await writeFile(filePath, imageBuffer);
	}
	await createCSV(csv);
	const files: string[] = await fs.promises.readdir(DATASET_PATH);

	const tarStream = tar.create({ gzip: true, cwd: DATASET_PATH }, files);
	const fstream = fs.createWriteStream(RESULT_PATH);
	const gzip = createGzip();

	tarStream.pipe(gzip).pipe(fstream);

	await new Promise((fulfill) => fstream.on("finish", fulfill));

	Logger.info("Finished creating dataset");
}

/**
 * creates a csv file with the id, date and trust of each post
 * @param csv
 */
async function createCSV(csv: CSVType[]) {
	Logger.info("Trying to create CSV");
	const output = stringify([...csv]);
	const fileName = "datasetInfo.csv";
	const filePath = join(DATASET_PATH, `/${fileName}`);
	await fs.promises.writeFile(filePath, output);
}

/**
 * Removes all files from the dataset folder
 */
async function clearDir() {
	fs.readdir(DATASET_PATH, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(join(`${DATASET_PATH}`, file), (err) => {
				if (err) throw err;
			});
		}
	});
}
