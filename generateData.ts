import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { Website } from "./Types/Website";
import { Logger } from "./Utility/logging";

const YEAR_NOW = 2023;

interface WorkingData {
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
		const text = sanatizeText(post.text);
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
		if (isNumber(data[i].date)) {
			Logger.trace(`After isNumber: ${data[i].date}`);
			data[i].trust++;
			if (text.length > i + 1) {
				const nextWord = text[i + 1];
				Logger.trace(`Next word: ${nextWord}`);
				const output = switchTypes(nextWord, data[i]);
				if (output === data[i]) continue;
				data[i] = output;
				if (text.length > i + 2) {
					const lastWord = text[i + 2];
					Logger.trace(`Last word: ${lastWord}`);
					data[i] = switchTypes(lastWord, data[i]);
				}
			}
		}
	}
	data = filterData(data);
	Logger.info(data.map((x) => `(${x.date} : ${x.trust})`));
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

function BC(data: WorkingData): WorkingData {
	return { date: `-${data.date}`, trust: data.trust++ };
}

function isCenturies(str: string) {
	return str.includes("centuries") || str.includes("c");
}
function centuries(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to century`);
	const nr = +data.date * 100;
	return { date: `${nr}`, trust: data.trust++ };
}

function isMillennium(str: string) {
	return str.includes("millennium") || str.includes("millenia");
}
function millennium(data: WorkingData): WorkingData {
	const nr = +data.date * 1000;
	return { date: `${nr}`, trust: data.trust++ };
}

function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}
function yearOld(data: WorkingData): WorkingData {
	return { date: (YEAR_NOW - +data.date).toString(), trust: data.trust };
}

function isNumber(str: string) {
	return !isNaN(+str);
}

function sanatizeText(text: string) {
	return text
		.toLowerCase()
		.replace(/[.,]/g, "")
		.replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "") //Remove img resolution eg (1080x960)
		.replace(/(\bBCE\b)/gi, "BC") //Replace BCE with BC
		.replace(/(\bCE\b)/gi, "AD")
		.replace(/(st|nd|rd|th)/gi, ""); //Replace CE with AD
}

function isRange(str: string) {
	const hasHyphen = str.includes("-") || str.includes("–");
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
		if (x.includes("bc")) return BC({ date: match, trust: data.trust });
		return { date: match, trust: data.trust };
	});
	const total = numbers.reduce(
		(acc: number, x: WorkingData) => +x.date + acc,
		0,
	);
	return { date: (total / numbers.length).toString(), trust: 0 };
}

function switchTypes(type: string, input: WorkingData) {
	Logger.trace(`switching Type ${type} for ${input.date}`);
	if (type.includes("bc")) return BC(input);
	if (type.includes("ad")) return input;
	if (isCenturies(type)) return centuries(input);
	if (isMillennium(type)) return millennium(input);
	if (isYearOld(type)) return yearOld(input);
	//TODO: Implement 'to' as range
	return input;
}
