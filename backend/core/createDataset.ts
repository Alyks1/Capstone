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

/**
 * creates a dataset from the given posts
 * @param page
 * @param posts
 */
export async function createDataset(page: Page, posts: Post[]) {
	Logger.info(`Downloading images from ${posts.length} posts`);

	await clearDir();

	const csv: CSVType[] = [];
	for (const post of posts) {
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
	}
	await createCSV(csv, DATASET_PATH);
	await createFilesFromCSV(page, DATASET_PATH);
	await createTar(DATASET_PATH, RESULT_PATH);
}

/**
 * creates a csv file with the id, date and trust of each post
 * @param csv
 */
async function createCSV(csv: CSVType[], path: string) {
	Logger.info("Creating CSV");
	const output = stringify([...csv]);
	const fileName = "/datasetInfo.csv";
	const filePath = join(path, fileName);
	return await fs.promises.writeFile(filePath, output);
}

async function createTar(path: string, resultPath: string) {
	Logger.info("Creating tar.gz file")
	const files: string[] = await fs.promises.readdir(path);

	const tarStream = tar.create({ gzip: true, cwd: path }, files);
	const fstream = fs.createWriteStream(resultPath);
	const gzip = createGzip();

	tarStream.pipe(gzip).pipe(fstream);

	await new Promise((fulfill) => fstream.on("finish", fulfill));

	Logger.info("Finished creating dataset");
}

async function createFilesFromCSV(page: Page, csvPath: string) {
	Logger.info("Creating files from CSV");
	const path = join(csvPath, "/datasetInfo.csv");
	const csv = await fs.promises.readFile(path, "utf-8");
	const lines = csv.split("\n");
	const posts: Post[] = [];
	for (const line of lines) {
		if (line === "" || line === undefined) continue;
		const id = line.split(",")[0];
		const imgSrc = line.split(",")[3];
		Logger.info("Downloading image: " + imgSrc);
		const response = await page.goto(imgSrc);
		const imageBuffer = await response.buffer();
		const fileName = `${id}.jpg`;
		const filePath = join(`${DATASET_PATH}/`, fileName);
		await writeFile(filePath, imageBuffer);
	}
	return posts;
}

/**
 * Removes all files from the dataset folder
 */
async function clearDir() {
	Logger.info("Removing Files from previous dataset");
	const files = await fs.promises.readdir(DATASET_PATH);
	for (const file of files) {
		await fs.promises.unlink(join(`${DATASET_PATH}`, file))
		Logger.info("Removed file: " + file);
	}
	Logger.info("Finished removing files from previous dataset");
}
