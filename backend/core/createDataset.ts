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
import os from "os";

const DATASET_PATH = "/output/dataset";
const RESULT_PATH = "/output/result.tar.gz";
const HOME_DIR = `${os.homedir()}/Desktop`;

interface CSVType {
	date: string;
	trust: number;
	id: string;
}

//TODO: Clean result folder before creating new dataset
export async function createDataset(page: Page, posts: Post[]) {
	Logger.info(`Downloading images from ${posts.length} posts`);
	const csv: CSVType[] = [];

	for (const post of posts) {
		const response = await page.goto(post.imgSrc);
		const imageBuffer = await response.buffer();
		const date = post.data.date;
		const trust = post.data.trust;
		const id = uuidv4().toString();
		csv.push({
			date: date,
			trust: trust,
			id: id,
		});
		const fileName = `${id}.jpg`;
		const filePath = join(`${HOME_DIR}/`, `${DATASET_PATH}/`, `${fileName}`);
		await writeFile(filePath, imageBuffer);
	}
	await createCSV(csv);
	const files: string[] = await fs.promises.readdir(
		`${HOME_DIR}/output/dataset/`,
	);

	const tarStream = tar.create(
		{ gzip: true, cwd: `${HOME_DIR}/output/dataset` },
		files,
	);

	const resultsPath = join(`${HOME_DIR}/`, RESULT_PATH);
	const fstream = fs.createWriteStream(resultsPath);
	const gzip = createGzip();
	tarStream.pipe(gzip).pipe(fstream);

	fstream.on("finish", () => {
		Logger.info("Finished compressing");
	});
}

async function createCSV(csv: CSVType[]) {
	Logger.info("Trying to create CSV");
	const output = stringify([...csv]);
	const fileName = "datasetInfo.csv";
	const filePath = join(`${HOME_DIR}/`, `${DATASET_PATH}`, `/${fileName}`);
	await fs.promises.writeFile(filePath, output);
}
