import { Post } from "../Types/Post";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import fs from "fs";

interface CalcTrustActivations {
	notBetween0and100: boolean;
	differentNr: boolean;
	multipleOf10and5: boolean;
	between0and10: boolean;
	reduceTrust: number;
}

var notBetween0and100 = true;
var differentNr = false;
var multipleOf10and5 = true;
var between0and10 = true;
var reduceTrust = 1;
/**
 * Adds or removes trust based on the number properties.
 *
 * - Numbers between 0 and 100 have decreased trust
 * - Many different numbers have increased trust
 * @param data WorkingData array which to calc trust on
 * @returns
 */
export function calcTrust(data: WorkingData[]) {
	getCalcTrustActivations();
	data.forEach((x) => {
		Logger.trace(`Before: ${x.date} : ${x.trust}`);
		//If the date is not between 0 and 100
		if (+x.date < 0 || +x.date > 101) 
			x.trust = Utility.adjustTrust(x.trust, 1, notBetween0and100);
		//If many different numbers, more precision
		if (new Set([...x.date]).size === x.date.length) 
			x.trust = Utility.adjustTrust(x.trust, 1, differentNr);
		//if the date is not a multiple of 10 and 5, more precision
		if (+x.date % 10 !== 0 && +x.date % 5 !== 0) 
			x.trust = Utility.adjustTrust(x.trust, 1, multipleOf10and5);
		//if the date is between 1 and 10, less likely to be a year
		if (+x.date > 0 && +x.date < 11) 
			x. trust = Utility.adjustTrust(x.trust, 1, between0and10);
		//reduce trust by one to stop trust inflation
		Logger.info(`Reduce trust: ${reduceTrust}`);
		x.trust = Utility.adjustTrust(x.trust,reduceTrust * -1, true);
		return x;
	});
	if (data.length === 1) data[0].trust;
	data.map((x) => { Logger.trace(`After: ${x.date} : ${x.trust}`); return x;});
	return data;
}

/**
 * Filteres data by removing entries with less than 1 trust or dates above 1940
 * @param data data to be filtered
 * @returns
 */
export function filterData(data: WorkingData[]) {
	//If trust is less than 1, remove
	data = data.filter((x) => x.trust > 0);
	//If data is above 1940, remove
	data = data.filter((x) => +x.date < 1940);
	return data;
}
/**
 * Choses one entry from the Array with the highest trust
 * @param data WorkingData collection from where to choose the most trusted
 * @returns
 */
export function chooseMostTrusted(data: WorkingData[]) {
	let result: WorkingData = data[0];
	Logger.debug(data.map((x) => `\n(${x.date.padEnd(7, " ")} : ${x.trust})`));
	data.forEach((x) => {
		if (x.trust > result.trust) result = x;
	});
	return result;
}

/**
 * Weighs the posts' trust with the website trust to get a final trust
 * @param posts
 * @param websiteWeight
 * @returns
 */
export function addWebsiteWeight(posts: Post[], websiteWeight: number): Post[] {
	Logger.debug(
		posts.map((x) => `\n(${x.data.date.padEnd(7, " ")} : ${x.data.trust})`),
	);
	posts.forEach((x) => {
		x.data.trust = Math.round(x.data.trust * websiteWeight);
		if (x.data.trust === 0) x.data.trust = 1;
	});
	Logger.info(
		posts.map((x) => `\n(${x.data.date.padEnd(7, " ")} : ${x.data.trust})`),
	);
	return posts;
}

export async function changeCalcTrustActivations(activations) {
	const fileData = await fs.promises.readFile("./trustActivations.json");
	const jsonData: CalcTrustActivations = JSON.parse(fileData.toString());
	jsonData.notBetween0and100 = activations.notBetween0and100;
	jsonData.differentNr = activations.differentNr;
	jsonData.multipleOf10and5 = activations.multipleOf10and5;
	jsonData.between0and10 = activations.between0and10;
	jsonData.reduceTrust = activations.reduceTrust;
	
	const writeData = JSON.stringify(jsonData);
	await fs.promises.writeFile("./trustActivations.json", writeData);
}

export async function getCalcTrustActivations() {
	const buffer =  await fs.promises.readFile("./trustActivations.json");
	const data: CalcTrustActivations = JSON.parse(buffer.toString());
	notBetween0and100 = data.notBetween0and100;
	differentNr = data.differentNr;
	multipleOf10and5 = data.multipleOf10and5;
	between0and10 = data.between0and10;
	reduceTrust = Number(data.reduceTrust);

	return JSON.stringify(data);
}