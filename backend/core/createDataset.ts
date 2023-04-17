import { createGzip } from "zlib";
import { join } from "path";
import { Logger } from "./Utility/logging";
import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { stringify } from "csv";
import { v4 as uuidv4 } from "uuid";
import * as tar from "tar";
import fs from "fs";
import { getBrowser } from ".";
import sharp from "sharp";

const DATASET_PATH = "../frontend/output/dataset";
const RESULT_PATH = "../frontend/output/dataset.tar.gz";
const BACKUP_PATH = "../frontend/output/backup";
const IMAGE_SIZE = 224;

interface CSVType {
	date: string;
	trust: number;
	id: string;
	imgSrc: string;
}

//Create two CSVs, one to act as a backup that wont change
//and one that will change if some datapoints are disabled

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
	await createCSV(csv, "/_datasetInfo.csv", DATASET_PATH);
	await createCSV(csv, "/backup.csv", BACKUP_PATH);
	await createFilesFromCSV(page, "/_datasetInfo.csv", DATASET_PATH);
	await createTar();
}

/**
 * creates a csv file with the id, date and trust of each post
 * @param csv
 */
async function createCSV(csv: CSVType[], fileName: string, path: string) {
	Logger.trace("Creating CSV");
	const output = stringify([...csv]);
	const filePath = join(path, fileName);
	return await fs.promises.writeFile(filePath, output);
}

/**
 * Creates a tar.gz file from the dataset folder
 * @param path
 * @param resultPath
 */
async function createTar() {
	Logger.trace("Creating tar.gz file");
	const files: string[] = await fs.promises.readdir(DATASET_PATH);

	const tarStream = tar.create({ gzip: true, cwd: DATASET_PATH }, files);
	const fstream = fs.createWriteStream(RESULT_PATH);
	const gzip = createGzip();

	tarStream.pipe(gzip).pipe(fstream);

	await new Promise((fulfill) => fstream.on("finish", fulfill));
}

/**
 * Takes the csv file and downloads the images from the imgSrc column
 */
async function createFilesFromCSV(
	page: Page,
	fileName: string,
	filePath: string,
) {
	Logger.trace("Creating files from CSV");
	const path = join(filePath, fileName);
	const csv = await fs.promises.readFile(path, "utf-8");
	const lines = csv.split("\n");
	for (const line of lines) {
		if (line === "" || line === undefined) continue;
		const id = line.split(",")[0];
		if (id === "") continue;
		const imgSrc = line.split(",")[3];
		const imgName = `${id}.jpg`;
		const imgPath = join(`${filePath}/`, imgName);
		await createImage(imgSrc, imgPath, page);
	}
}

/**
 * Removes all files from the dataset folder
 */
async function clearDir() {
	Logger.debug("Removing Files from previous dataset");
	const files = await fs.promises.readdir(DATASET_PATH);
	for (const file of files) {
		await fs.promises.unlink(join(`${DATASET_PATH}`, file));
		Logger.trace(`Removed file: ${file}`);
	}
	Logger.debug("Finished removing files from previous dataset");
}

export async function updateDataset(ignoreIDs: string[]) {
	Logger.debug(ignoreIDs);
	const browser = await getBrowser();
	const page = await browser.newPage();

	const path = join(BACKUP_PATH, "/backup.csv");
	const csvLines = await fs.promises.readFile(path, "utf-8");
	const lines = csvLines.split("\n");

	await clearDir();

	const csv: CSVType[] = [];
	for (const line of lines) {
		const linearr = line.split(",");
		const id = linearr[0];
		if (ignoreIDs?.includes(id) || id === "") continue;
		const date = linearr[1];
		const trust = linearr[2];
		const src = linearr[3];
		csv.push({
			id: id,
			date: date,
			trust: Number(trust),
			imgSrc: src,
		});
	}
	await createCSV(csv, "/_datasetInfo.csv", DATASET_PATH);
	await createFilesFromCSV(page, "/_datasetInfo.csv", DATASET_PATH);
	await createTar();
}

async function createImage(src: string, fileName: string, page: Page) {
	const response = await page.goto(src);
	const imageBuffer = await response.buffer();
	//TODO: Allow user to choose image format?
	await sharp(imageBuffer)
		.resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "fill" })
		.toFile(fileName)
		.finally(() => {});
}
