import { Page } from "puppeteer";
import { Post } from "../Types/Post";
import { Website } from "../Types/Website";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import {
	BC,
	centuries,
	isBC,
	isCenturies,
	isConnectingWord,
	isMillennium,
	isYearOld,
	millennium,
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
		const text = Utility.sanatizeText(post.text);
		Logger.debug(text);
		const textArr = text.split(" ");
		createDate(textArr);
	}
}

function createDate(text: string[]) {
	Logger.trace(`Text: ${text}`);
	let data: WorkingData[] = [];
	for (let i = 0; i < text.length; i++) {
		data[i] = {
			date: text[i],
			trust: 0,
			pos: 0,
		};
		if (!data[i].date) continue;
		if (isRange(data[i].date)) {
			Logger.trace(`After isRange: ${data[i].date}`);
			data[i] = averageRange(data[i]);
		}
		if (Utility.isNumber(data[i].date)) {
			Logger.trace(`After isNumber: ${data[i].date}`);
			data[i].trust++;
			LookAhead(text, i, data);
		}
	}
	data = filterData(data);
	Logger.info(data.map((x) => `(${x.date} : ${x.trust})`));
}

function LookAhead(text: string[], i: number, data: WorkingData[]) {
	data[i].pos++;
	if (text.length > i + data[i].pos) {
		const temp = data[i];
		data[i] = switchTypes(data, text, i);
		data[i].pos++;
		if (temp.date === data[i].date) return data;
		if (text.length > i + data[i].pos) {
			data[i] = switchTypes(data, text, i);
		}
	}
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
function averageRange(data: WorkingData): WorkingData {
	Logger.trace(`Averaging range: ${data.date}`);
	const matchNrs = /[0-9]+/g;
	const bothNrs = data.date.split("-");
	Logger.trace(bothNrs);
	const numbers = bothNrs.map((x) => {
		const match = (x.match(matchNrs) ?? [""])[0];
		// const result: WorkingData = { date: match, trust: data.trust };
		if (isBC(x)) return BC({ date: match, trust: data.trust, pos: data.pos });
		return { date: match, trust: data.trust };
	});
	const total = numbers.reduce(
		(acc: number, x: WorkingData) => +x.date + acc,
		0,
	);
	return { date: (total / numbers.length).toString(), trust: 0, pos: data.pos };
}

function switchTypes(
	data: WorkingData[],
	text: string[],
	i: number,
): WorkingData {
	const currentData = data[i];
	const type = text[i + currentData.pos];
	Logger.trace(`switching Type ${type} for ${currentData.date}`);
	if (isBC(type)) return BC(currentData);
	if (type.includes("ad")) return currentData;
	if (isCenturies(type)) return centuries(currentData);
	if (isMillennium(type)) return millennium(currentData);
	if (isYearOld(type)) return yearOld(currentData, YEAR_NOW);
	if (isConnectingWord(type)) return LookAhead(text, i, data)[i];
	return currentData;
}
