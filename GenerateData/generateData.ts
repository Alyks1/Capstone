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
	isMillennium,
	isYearOld,
	millennium,
	yearOld,
} from "./dateTypes";

const YEAR_NOW = 2023;

export interface WorkingData {
	date: string;
	trust: number;
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
		};
		if (!data[i].date) continue;
		if (isRange(data[i].date)) {
			Logger.trace(`After isRange: ${data[i].date}`);
			data[i] = averageRange(data[i]);
		}
		if (Utility.isNumber(data[i].date)) {
			Logger.trace(`After isNumber: ${data[i].date}`);
			data[i].trust++;
			if (text.length > i + 1) {
				const temp = data[i];
				data[i] = lookAhead(text, i, 1, data);
				if (temp.date === data[i].date) continue;
				if (text.length > i + 2) {
					data[i] = lookAhead(text, i, 2, data);
				}
			}
		}
	}
	data = filterData(data);
	Logger.info(data.map((x) => `(${x.date} : ${x.trust})`));
}

function lookAhead(
	text: string[],
	i: number,
	place: number,
	data: WorkingData[],
) {
	const nextWord = text[i + place];
	Logger.trace(`${place}. word: ${nextWord}`);
	return switchTypes(nextWord, data[i]);
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
	const hasHyphen = str.includes("-");
	const hasSlash = str.includes("/");
	const hasNumbers = str.match(/[0-9]+/);
	return (hasHyphen && hasNumbers) || (hasSlash && hasNumbers);
}
function averageRange(data: WorkingData): WorkingData {
	Logger.trace(`Averaging range: ${data.date}`);
	const matchNrs = /[0-9]+/g;
	const bothNrs = data.date.split("-");
	const numbers = bothNrs.map((x) => {
		const match = (x.match(matchNrs) ?? [""])[0];
		const result: WorkingData = { date: match, trust: data.trust };
		if (isBC(x)) return BC(result);
		result;
	});
	const total = numbers.reduce(
		(acc: number, x: WorkingData) => +x.date + acc,
		0,
	);
	return { date: (total / numbers.length).toString(), trust: 0 };
}

function switchTypes(type: string, input: WorkingData): WorkingData {
	Logger.trace(`switching Type ${type} for ${input.date}`);
	if (isBC(type)) return BC(input);
	if (type.includes("ad")) return input;
	if (isCenturies(type)) return centuries(input);
	if (isMillennium(type)) return millennium(input);
	if (isYearOld(type)) return yearOld(input, YEAR_NOW);
	//TODO: Implement 'to' as range
	return input;
}
