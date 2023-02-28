import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { Website } from "./Types/Website";
import { WorkingData } from "./Types/WorkingData";
import { Utility } from "./Utility/utility";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "./Utility/logging";

//Within 100 years difference allow a range to be calculated
const AD_TIME_INTERVAL = 276; //Qing Dynasty
const AD_TIME_INTERVAL_CENURIES = 3;
const START_TRUST = 2;
const MAX_YEAR_ALLOWED = 1940;

export async function CreateDataSetFromPost(
	posts: Post[],
	page: Page,
	website: Website,
) {
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
		data.trust = CalculateTotalTrust(data, website);

		Logger.Info(`(Date: ${data.date}, Trust: ${data.trust})`);

		await saveData(data, page, post);
	}
}

async function saveData(data: WorkingData, page: Page, post: Post) {
	Logger.Trace("Saving data");
	//Use fetch to download img
	await page.goto(post.imgSrc);
	//The higher the trust, the more often an image is in the dataset
	for (let i = 0; i < data.trust; i++) {
		//Image name needs ID so duplicates cannot overwrite
		const id = uuidv4().toString();
		const filename = `${data.date}_${id}`;

		await page.pdf({ path: `./Images/${filename}.pdf` });
	}
}

function extractDates(text: string) {
	Logger.Trace("Extracting dates");
	//Remove . and ,
	//Remove img resolution eg (1080x960)
	//Replace BCE with BC
	//Replace CE with AD
	const sanatizedText = text
		.replace(/[.,]/g, "")
		.replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "")
		.replace(/(\bBCE\b)/gi, "BC")
		.replace(/(\bCE\b)/gi, "AD");

	//TODO: Add "year old" or "years ago" logic
	const regexp =
		/(([0-9]+[stndrh]{2})+[– -](\bmillenium\b|\bcentury\b)[ ABCD]*)|(([0-9]+)([ 0-9])*([ABCD]{2})?)/gi;

	Logger.Debug(sanatizedText);
	const results: string[] = [];

	for (const match of sanatizedText.matchAll(regexp) || [])
		results.push(match[0]);

	if (results.length <= 0) return [];

	return results;
}

function evaluateDates(data: WorkingData) {
	//Reverse array to have BC, century etc words that are normally at the end
	//of the sentence at the front
	data.workingDates = data.dates.reverse();
	Logger.Debug(`[ ${data.workingDates} ]`);
	//Saves a boolean array to see where centuries need to be converted
	data.yearWords = data.workingDates.map((d) => {
		if (d.includes("century")) return "00";
		if (d.includes("millenium")) return "000";
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

	const r = averageRanges(data);
	return r;
}

//Only translates centuries into numbers
function convertYearWords(data: WorkingData) {
	data.workingDates = data.workingDates.map((x) => x.replace(/ /gi, ""));
	const temp: string[] = [];
	const startsWithNumberRegex = /[0-9]+/g;
	for (let i = 0; i < data.workingDates.length; i++) {
		if (data.yearWords[i] !== "") {
			const bc = data.yearLabels[i];
			const number = data.workingDates[i].match(startsWithNumberRegex)[0];
			temp[i] = number;
			data.workingDates[i] = `${number}${data.yearWords[i]}${bc}`;
		} else {
			//If the number has no 'century' text, add one if the numbers are AD_TIME_INTERVAL_CENURIES apart
			//eg '3rd to 4th century' or [ '3', '4th century' ] only being [ '3', '400' ]. Now [ '300', '400' ]
			temp.forEach((x, index) => {
				if (Math.abs(+x - +data.workingDates[i]) < AD_TIME_INTERVAL_CENURIES) {
					//BC logic can be negated because it is ignored anyway
					const number = data.workingDates[i].match(startsWithNumberRegex)[0];
					data.workingDates[i] = `${number}${data.yearWords[index]}`;
				}
			});
		}
	}
	Logger.Trace("finished converting year words: ");
	Logger.Trace(data.workingDates);
	return data;
}

//Takes format: [ '37 BC', '31 AD' ], [ '37', '31 BC' ], [ '3', '400' ]
//and averages their range
function averageRanges(data: WorkingData) {
	const numbers = data.workingDates.map((x) => +x);
	const total = numbers.reduce((acc: number, x: number) => x + acc, 0);
	data.date = Math.round(total / data.workingDates.length).toString();
	return data;
}

//Converts both sides to BC or AD depending on first one if only one
//Finds differences of ADs
function removeAnomalies(data: WorkingData) {
	data.workingDates = data.workingDates.filter((x) => x.length > 1);
	//ignores nr above 1940
	data.workingDates = data.workingDates.filter((x) => +x < MAX_YEAR_ALLOWED);
	//if any of the WorkingDates numbers start with -, ignore this step
	if (data.workingDates.findIndex((x) => x.startsWith("-")) < 0) {
		const newData: string[] = [];
		const differences = Utility.getDifferences(data.workingDates);

		for (let i = 0; i < differences.length; i++) {
			//Reduce trust for each skip
			if (differences[i] > AD_TIME_INTERVAL) {
				data.trust--;
				continue;
			} else if (differences[i] < 50) {
				data.trust++;
			}
			newData[i] = data.workingDates[i];
			newData[i + 1] = data.workingDates[i + 1];
		}
		//What if nothing works eg [1940,1100] ie only continues
		if (newData.length === 0) {
			const numbers = data.workingDates.map((x) => +x);
			//Choose the lowest number (subject to change)
			//TODO: Add trust to individual data and use that before using the lowest nr
			newData[0] = Math.min(...numbers).toString();
			//Reduce Trust if a choice had to be made
			if (data.workingDates.length !== newData.length)
				data.trust = data.trust - 2;
			//Increase trust if only one number is found
			if (data.workingDates.length === 1) data.trust++;
		}
		data.workingDates = newData.filter((x) => x);
	}
	Logger.Trace("Finished removing anomalies: ");
	Logger.Trace(data.workingDates);
	return data;
}

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
	Logger.Trace("finished converting to nr: ");
	Logger.Trace(data.workingDates);
	return data;
}

function CalculateTotalTrust(data: WorkingData, website: Website) {
	const normalizeWeight = 1;
	const websiteWeight = website.weight;
	let dataTrust = data.trust;
	//Always use data. if one is set to 0 here, data could be negated
	if (dataTrust < 1) dataTrust = 1;
	const multiplicator = normalizeWeight + websiteWeight;
	return Math.round(multiplicator * dataTrust);
}
