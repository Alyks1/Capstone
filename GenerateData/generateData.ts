import { Page } from "puppeteer";
import { Post } from "../Types/Post";
import { Website } from "../Types/Website";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
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

const YEAR_NOW = 2023;

export interface WorkingData {
	date: string;
	trust: number;
	pos: number;
}

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
		data = calcTrust(data);
		Logger.info(data.map((x) => `(${x.date} : ${x.trust})`));
	}
}

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

function LookAhead(text: string[], i: number, data: WorkingData) {
	data.pos++;
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

function treeStump(data: WorkingData, text: string[], i: number) {
	if (isRange(data.date)) {
		Logger.trace(`After isRange: ${data.date}`);
		data = averageRange(data, text);
	}
	if (Utility.isNumber(data.date)) {
		Logger.trace(`After isNumber: ${data.date}`);
		data.trust++;
		data = LookAhead(text, i, data);
	}
	return data;
}

function calcTrust(data: WorkingData[]) {
	data.forEach((x) => {
		//If the date is not between 0 and 100
		if (+x.date < 0 || +x.date > 101) x.trust++;
		//If many different numbers, more precision
		if (new Set([...x.date]).size === x.date.length) x.trust++;
	});
	if (data.length === 1) data[0].trust + 2;
	return data;
}
function filterData(data: WorkingData[]) {
	//If trust is less than 1, remove
	data = data.filter((x) => x.trust >= 1);
	//If data is 1 char wide, remove
	data = data.filter((x) => x.date.length > 1);
	//If data is above 1940, remove
	data = data.filter((x) => +x.date < 1940);
	return data;
}

function isRange(str: string) {
	const newStr = str.replace(/\//, "-");
	const hasHyphen = newStr.includes("-");
	const hasNumbers = newStr.match(/[0-9]+/);
	return hasHyphen && hasNumbers;
}
function averageRange(data: WorkingData, text: string[]): WorkingData {
	Logger.trace(`Averaging range: ${data.date}`);
	const matchNrs = /[0-9]+/g;
	const bothNrs = data.date.split("-");
	Logger.trace(bothNrs);
	const numbers = bothNrs.map((x) => {
		const match = (x.match(matchNrs) ?? [""])[0];
		if (isBC(x)) return BC({ date: match, trust: data.trust, pos: data.pos });
		return { date: match, trust: data.trust };
	});
	const total = numbers.reduce(
		(acc: number, x: WorkingData) => +x.date + acc,
		0,
	);
	return {
		date: (total / numbers.length).toString(),
		trust: data.trust++,
		pos: data.pos,
	};
}

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
