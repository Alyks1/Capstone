import { join } from "path";
import { Logger } from "./Utility/logging";
import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { v4 as uuidv4 } from "uuid";
import { stringify } from "csv";
import * as tar from "tar";
import { createGzip } from "zlib";
import fs from "fs";
import writeFile from "write-file-atomic";

const DATASET_PATH = "../../output/dataset";
const RESULT_PATH = "../../output/result.tar.gz";

interface CSVType {
	date: string;
	trust: number;
	id: string;
}

export async function createDataset(page: Page, posts: Post[]) {
	Logger.info(`Downloading images from ${posts.length} posts`);
	const csv: CSVType[] = [];
	const files: string[] = [];

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
		const fileName = join(__dirname, `${DATASET_PATH}/${id}.jpg`);
		files.push(fileName);
		await writeFile(fileName, imageBuffer);
	}
	files.push(await createCSV(csv));
	const tarStream = tar.create({ gzip: true }, files);

	Logger.info("Trying to create results stream");
	const resultsPath = join(__dirname, RESULT_PATH);
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
	const fileName = join(__dirname, `${DATASET_PATH}/datasetInfo.csv`);
	await fs.promises.writeFile(fileName, output);
	return fileName;
}
