import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { Website } from "./Types/Website";
import { WorkingData } from "./Types/WorkingData";
import { Utility } from "./Utility/utility";

//Within 100 years difference allow a range to be calculated
const AD_TIME_INTERVAL = 276; //Qing Dynasty

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
		};

		data = evaluateDates(data);

		//TODO: use Website weight and post trust to weigh the outcome

		//Use fetch to download img
		await page.goto(post.imgSrc);
		//TODO: Image name needs ID so duplicates cannot overwrite
		await page.pdf({ path: `./Images/${data.date}.pdf` });
	}
}

function extractDates(text: string) {
	//Remove . and ,
	//Remove img resolution eg (1080x960)
	//Replace BCE with BC
	//Replace CE with AD
	const sanatizedText = text
		.replace(/[.,]/g, "")
		.replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "")
		.replace(/(\bBCE\b)/gi, "BC")
		.replace(/(\bCE\b)/gi, "AD");

		//TODO: Add millenium
	const regexp =
		/(([0-9]+[stndrh]{2})+[– -](\bcentury\b)[ ABCD]*)|(([0-9]+)([ 0-9])*([ABCD]{2})?)/gi;

	console.log(sanatizedText);
	const results: string[] = [];

	for (const match of sanatizedText.matchAll(regexp) || [])
		results.push(match[0]);

	if (results.length <= 0) return [];

	return results;
}

function evaluateDates(data: WorkingData) {
	//Reverse array to have BC, century etc words that are normally at the end
	//of the sentence at the front
	const reversedDates = data.dates.reverse();
	data.workingDates = reversedDates;
	console.log(data.workingDates);
	//Saves a boolean array to see where centuries need to be converted
	data.centuries = reversedDates.map((d) => d.includes("century"));

	//Stores each BC in a seperate array
	data.yearLabels = reversedDates.map((d) => {
		if (d.includes("bc")) return "bc";
		if (d.includes("ad")) return "";
		return "";
	});

	data.workingDates = convertCenturies(data);

	const r = averageRanges(data);
	console.log(`(Date: ${data.date}, Trust: ${data.trust})`);
	return r;
}

//Only translates centuries into numbers
function convertCenturies(data: WorkingData) {
	const temp: string[] = [];
	const startsWithNumberRegex = /[0-9]+/g;
	for (let i = 0; i < data.workingDates.length; i++) {
		if (data.centuries[i] === true) {
			let bc = data.yearLabels[i];
			const number = data.workingDates[i].match(startsWithNumberRegex)[0];
			temp[i] = number;
			data.workingDates[i] = `${number}00${bc}`;
		} else {
			//If the number has no 'century' text, add one if the numbers are 2 number apart
			//eg '3rd to 4th century' or [ '3', '4th century' ] only being [ '3', '400' ]. Now [ '300', '400' ]
			temp.forEach((x) => {
				if (Math.abs(+x - +data.workingDates[i]) < 3) {
					//BC logic can be negated because it is ignored anyway
					const number = data.workingDates[i].match(startsWithNumberRegex)[0];
					data.workingDates[i] = `${number}00`;
				}
			});
		}
	}
	return data.workingDates;
}

//Takes format: [ '37 BC', '31 AD' ], [ '37', '31 BC' ], [ '3', '400' ]
//Converts both sides to BC or AD depending on first one if only one
//Finds differences of ADs and averages their range
function averageRanges(data: WorkingData) {
	let label: string;
	for (let i = 0; i < data.workingDates.length; i++) {
		if (data.yearLabels[i] !== "") label = data.yearLabels[i];
		data.yearLabels[i] = label;
		let bc = "";
		if (data.yearLabels[i] === "bc") bc = "-";
		const number = data.workingDates[i].replace(/(bc|ad)/gi, "").trim();
		data.workingDates[i] = bc + number;
	}

	//TODO: Fix multiple numbers like 5th-4th century BC and 1950 using the 1950

	//if any of the WorkingDates numbers start with -, ignore this step
	if (data.workingDates.findIndex((x) => x.startsWith("-")) < 0) {
		const newData: string[] = [];
		const differences = Utility.getDifferences(data.workingDates);

		for (let i = 0; i < differences.length; i++) {
			//Reduce trust for each skip
			if (differences[i] > AD_TIME_INTERVAL) continue;
			newData[i] = data.workingDates[i];
			newData[i + 1] = data.workingDates[i + 1];
		}
		//What if nothing works ie [1940,1100] ie only continues ^
		if (newData.length === 0) {
			const numbers = data.workingDates.map((x) => +x);
			//Choose the lowest number (subject to change)
			newData[0] = Math.min(...numbers).toString();
			//Reduce Trust
		}
		data.workingDates = newData.filter((x) => x);
	}

	//TODO: implement trust
	const numbers = data.workingDates.map((x) => +x);
	const total = numbers.reduce((acc: number, x: number) => x + acc, 0);
	data.date = Math.round(total / data.workingDates.length).toString();
	return data;
}
