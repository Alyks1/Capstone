import { Page } from "puppeteer";
import { Post } from "../Types/Post";
import { Website } from "../Types/Website";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import { averageRange, isRange } from "./calculateRange";
import {
	AD,
	BC,
	centuries,
	isBC,
	isCenturies,
	isConnectingWord,
	isMillennium,
	isYearOld,
	millennium,
	noMatch,
	yearOld,
} from "./dateTypes";
import { calcTrust, chooseMostTrusted, filterData } from "./ProcessData";

const YEAR_NOW = 2023;

export async function generateDataFromPost(
	posts: Post[],
	page: Page,
	website: Website,
) {
	Logger.trace(`Creating data from ${posts.length} posts`);
	for (let post of posts) {
		Logger.debug(post.text);
		const text = Utility.sanatizeText(post.text);
		const textArr = text.split(" ");
		let data = createDate(textArr);

		data = filterData(data);
		if (data.length < 1) continue;
		data = calcTrust(data);
		const FinalData = chooseMostTrusted(data);
		Logger.info(`(${FinalData.date} : ${FinalData.trust})`);
	}
}

/**
 * Iterates through every word and puts it to the top of the tree
 * @param text Array containing every word
 * @returns
 */
function createDate(text: string[]) {
	let data: WorkingData[] = [];
	for (let i = 0; i < text.length; i++) {
		data[i] = {
			date: text[i],
			trust: 0,
			pos: 0,
		};
		data[i] = treeStump(data[i], text, i);
	}
	return data;
}

/**
 * Checks if the data is a range, if so averages it.
 * Then checks if the data is a number, if so, look ahead to the next word
 * to match the date types.
 *
 * Root of the Process.
 * @param data Data being worked with
 * @param text Array of all text words
 * @param i Current index of the text array
 * @returns
 */
function treeStump(data: WorkingData, text: string[], i: number) {
	data.pos++;
	if (isRange(data.date)) {
		Logger.trace(`After isRange: ${data.date}`);
		let txt = "";
		if (text.length > i + data.pos) txt = text[i + data.pos];
		data = averageRange(data, txt);
	}
	if (Utility.isNumber(data.date)) {
		Logger.trace(`After isNumber: ${data.date}`);
		data.trust++;
		data = LookAhead(data, i, text);
	}
	return data;
}

/**
 * Looks at the next word to match with the date types. If there is a match, look at the next position and do again.
 * @param text Array of all text words
 * @param i Current index in the array
 * @param data Current data being worked on
 * @returns WorkingData that
 */
function LookAhead(data: WorkingData, i: number, text: string[]) {
	if (text.length > i + data.pos) {
		const temp = data;
		data = switchTypes(data, text, i);
		data.pos++;
		if (temp.date === data.date && data.pos < 3) return data;
		if (text.length > i + data.pos) {
			data = switchTypes(data, text, i);
		}
	}
	return data;
}

/**
 * Matches a word with date types to decide which action to take
 * @param data Current data being worked on
 * @param text Array of all text words
 * @param i Current index in the array
 * @returns
 */
function switchTypes(
	data: WorkingData,
	text: string[],
	i: number,
): WorkingData {
	const type = text[i + data.pos];
	Logger.trace(`switching Type ${type} for ${data.date}`);
	if (isBC(type)) return BC(data);
	if (type.includes("ad")) return AD(data);
	if (isCenturies(type)) return centuries(data);
	if (isMillennium(type)) return millennium(data);
	if (isYearOld(type)) return yearOld(data, YEAR_NOW);
	if (isConnectingWord(type)) return treeStump(data, text, i);
	return noMatch(data);
}
