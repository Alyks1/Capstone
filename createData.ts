import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { Website } from "./Types/Website";
import { WorkingData } from "./Types/WorkingData";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "./Utility/logging";
import { Anomalies } from "./Utility/removeAnomalies/removeAnomalies";

//Within 100 years difference allow a range to be calculated
const AD_TIME_INTERVAL = 276; //Qing Dynasty
const AD_TIME_INTERVAL_CENURIES = 3;
const START_TRUST = 2;
const MAX_YEAR_ALLOWED = 1940;
const YEAR_NOW = 2023;

/**
 * Creates the dataset from an array of posts
 * @param posts all posts scraped from a website
 * @param page puppeteer page to surf
 * @param website from which the posts were scraped
 */
export async function CreateDataSetFromPost(
	posts: Post[],
	page: Page,
	website: Website,
) {
	Logger.trace(`Creating data from ${posts.length} posts`);
	//Goto each imageSrc and screenshot/pdf it
	//Use text as name
	//There must be a better way to do this but here we are
	for (let post of posts) {
		const dates = extractDates(post.text);
		if (dates.length <= 0) continue;

		//Remove trailing whitespaces and makes everything lowercase
		let data: WorkingData = {
			dates: dates.map((d) => d.trim().toLowerCase()),
			trust: START_TRUST,
		};

		data = evaluateDates(data);

		//Use Website weight and post trust to weigh the outcome
		data.trust = calculateTotalTrust(data.trust, website.weight);

		Logger.info(`(Date: ${data.date.padEnd(5, " ")}, Trust: ${data.trust})`);

		await saveData(data, page, post.imgSrc);
	}
}

/**
 * Saves the image with the name being `date+id` a trust amount of times
 * eg: Trust of 5 will save the image 5 times
 *
 * @param data data with `trust` and `date`
 * @param page puppeteer page to surf
 * @param imgSrc to locate the image
 */
async function saveData(data: WorkingData, page: Page, imgSrc: string) {
	Logger.trace("Saving data");
	//Use fetch to download img
	await page.goto(imgSrc);
	//The higher the trust, the more often an image is in the dataset
	for (let i = 0; i < data.trust; i++) {
		//Image name needs ID so duplicates cannot overwrite
		const id = uuidv4().toString();
		const filename = `${data.date}_${id}`;

		//await page.pdf({ path: `./Images/${filename}.pdf` });
	}
}

/**
 * Takes a text and returns an array of dates
 * @param text gathered from a post
 * @returns array of potential dates
 */
function extractDates(text: string) {
	Logger.trace("Extracting dates");

	const sanatizedText = text
		.replace(/[.,]/g, "") //Remove . and ,
		.replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "") //Remove img resolution eg (1080x960)
		.replace(/(\bBCE\b)/gi, "BC") //Replace BCE with BC
		.replace(/(\bCE\b)/gi, "AD"); //Replace CE with AD

	//TODO: Maybe change this to semantic analysis
	const regexp =
		/(([0-9]+[stndrh]{2})+[– -](\bmillenium\b|\bcentury\b|\byears ago\b|\byear old\b)[ ABCD]*)|(([0-9]+)([ 0-9])*([ABCD]{2})?)/gi;

	Logger.debug(sanatizedText);

	const results: string[] = [];
	for (const match of sanatizedText.matchAll(regexp) || [])
		results.push(match[0]);

	if (results.length <= 0) return [];

	return results;
}

/**
 * Evaluates the dates gathered from the text and converts the dates to a uniform type
 * @param data to be cleaned
 * @returns `WorkingData` with updated final `date`
 */
function evaluateDates(data: WorkingData) {
	//Reverse array to have BC, century etc words that are normally at the end
	//of the sentence at the front
	data.workingDates = data.dates.reverse();
	Logger.debug(`[ ${data.workingDates} ]`);
	//Saves a boolean array to see where centuries need to be converted
	data.yearMagnitudes = data.workingDates.map((d) => {
		if (d.includes("century")) return "00";
		if (d.includes("millenium")) return "000";
		if (d.includes("years ago")) return "ya";
		if (d.includes("year old")) return "ya";
		return "";
	});

	//Stores each BC in a seperate array
	data.yearLabels = data.workingDates.map((d) => {
		if (d.includes("bc")) return "bc";
		if (d.includes("ad")) return "ad";
		return "";
	});

	data = convertYearWords(data);
	data = convertToNumbers(data);
	data = removeAnomalies(data);

	return calculateFinalDate(data);
}

/**
 * Converts words like `century` or `millenium` to 100s or 1000s respectively
 * @param data with `yearMagnitudes`, `yearLabels` and `WorkingData`
 * @returns data with `WorkingData` updated
 */
function convertYearWords(data: WorkingData) {
	data.workingDates = data.workingDates.map((x) => x.replace(/ /gi, ""));
	const temp: string[] = [];
	const startsWithNumberRegex = /[0-9]+/g;
	for (let i = 0; i < data.workingDates.length; i++) {
		if (data.yearMagnitudes[i] !== "") {
			const bc = data.yearLabels[i];
			const number = data.workingDates[i].match(startsWithNumberRegex)[0];
			temp[i] = number;
			if (data.yearMagnitudes[i] === "ya")
				data.workingDates[i] = calculateYearsAgo(number);
			else data.workingDates[i] = `${number}${data.yearMagnitudes[i]}${bc}`;
		} else {
			//If the number has no 'century' text, add one if the numbers are AD_TIME_INTERVAL_CENURIES apart
			//eg '3rd to 4th century' or [ '3', '4th century' ] only being [ '3', '400' ]. Now [ '300', '400' ]
			temp.forEach((x, index) => {
				if (Math.abs(+x - +data.workingDates[i]) < AD_TIME_INTERVAL_CENURIES) {
					//BC logic can be negated because it is ignored anyway
					const number = data.workingDates[i].match(startsWithNumberRegex)[0];
					data.workingDates[i] = `${number}${data.yearMagnitudes[index]}`;
				}
			});
		}
	}
	Logger.trace("finished converting year words: ");
	Logger.trace(data.workingDates);
	return data;
}

function calculateYearsAgo(age: string) {
	Logger.info(`Calculating years ago with age: ${age}`);
	const AgeNr = +age;
	return (YEAR_NOW - AgeNr).toString();
}

/**
 * Takes format: `[ '37' ]`, `[ '37', '-31' ]`, `[ '300', '400' ]`
 * and averages their range and saves it as `WorkingData.date`
 * @param data Working data that contains WorkingDates
 * @returns Working data with updated `date` field
 */
function calculateFinalDate(data: WorkingData) {
	const numbers = data.workingDates.map((x) => +x);
	const total = numbers.reduce((acc: number, x: number) => x + acc, 0);
	data.date = Math.round(total / data.workingDates.length).toString();
	return data;
}

/**
 * Removes data anomalies such as values higher than a threshold,
 * values 1 char long or values too far apart.
 * @param data to be cleaned up
 * @returns data with updated `WorkingDates`and `Trust`
 */
function removeAnomalies(data: WorkingData) {
	data.workingDates = Anomalies.removeSingleCharYears(data.workingDates);
	data.workingDates = Anomalies.removeYearsAboveThreashold(
		data.workingDates,
		MAX_YEAR_ALLOWED,
	);
	//Ignore year differences when BC
	if (data.workingDates.findIndex((x) => x.startsWith("-")) < 0)
		data = Anomalies.ignoreYearsToFarApart(data, AD_TIME_INTERVAL);

	Logger.trace("Finished removing anomalies: ");
	Logger.trace(data.workingDates);
	return data;
}

/**
 * Uses `data.yearLabels` to convert `data.workingdates` into positive or negative numbers
 *
 * eg: `['31 bc'] => ['-31']`
 * @param data containing yearLabels and workingdates
 * @returns data with converted dates
 */
function convertToNumbers(data: WorkingData) {
	let label: string;
	for (let i = 0; i < data.workingDates.length; i++) {
		if (data.yearLabels[i] !== "") label = data.yearLabels[i];
		data.yearLabels[i] = label;
		let bc = "";
		if (data.yearLabels[i] === "bc") bc = "-";
		const number = data.workingDates[i].replace(/[bcad]/gi, "").trim();
		data.workingDates[i] = bc + number;
	}
	Logger.trace("finished converting to nr: ");
	Logger.trace(data.workingDates);
	return data;
}

/**
 * Takes websiteWeight and dataTrust to calculate total trust.
 * @param dataTrust calculated in format: `whole number 1-10`
 * @param websiteWeight set in format: `decimal number 0-1`
 * @returns integer total trust
 */
function calculateTotalTrust(dataTrust: number, websiteWeight: number) {
	const normalizeWeight = 1;
	//Always use data. if one is set to 0 here, data could be negated
	if (dataTrust < 1) dataTrust = 1;
	if (dataTrust > 10) dataTrust = 10;
	const multiplicator = normalizeWeight + websiteWeight;
	return Math.round(multiplicator * dataTrust);
}
