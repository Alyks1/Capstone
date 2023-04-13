import { Logger } from "../Utility/logging";
import { WorkingData } from "../Types/WorkingData";
import { Utility } from "../Utility/utility";
import { averageRange } from "./calculateRange";

//TODO: add tokens such as testing for 'kg', 'g', 'km' etc

export function isBC(str: string) {
	return str.includes("bc") || str === "v";
}
export function BC(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to BC`);
	return { date: `-${data.date}`, trust: ++data.trust, pos: data.pos };
}
export function isAD(str: string) {
	return str.includes("ad") || str === "n";
}
export function AD(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to AD`);
	data.trust++;
	return data;
}

export function isCenturies(str: string) {
	return str === "century" || str === "c" || str === "centuries" || str === "cent"
	|| str === "jh";
}
export function centuries(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to century`);
	// 18th century is 1700-1799
	//-18th century is -1800 - -1701
	// Ergo, 18th century is 18* 100 - 50 = 1750
	// and -18th century is -18 * 100 + 50 = -1750
	var halfCentury = -50;
	if (data.date.startsWith("-")) halfCentury = 50;
	const nr = (+data.date * 100) + halfCentury;
	return { date: `${nr}`, trust: ++data.trust, pos: data.pos };
}

export function isMillennium(str: string) {
	return str === "millennium" || str === "millenia";
}
export function millennium(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to millennium`);
	var halfMillennium = -500;
	if (data.date.startsWith("-")) halfMillennium = 500;
	const nr = (+data.date * 1000) + halfMillennium;

	return { date: `${nr}`, trust: ++data.trust, pos: data.pos };
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}
export function yearOld(data: WorkingData, now: number): WorkingData {
	Logger.trace(`converting ${data.date} to year old`);
	const regex = /[0-9]+/;
	const match = regex.exec(data.date);
	if (!match) return data;
	const number = Number(match[0]);
	return {
		date: (now - number).toString(),
		trust: ++data.trust,
		pos: data.pos,
	};
}

export function isConnectingWord(str: string) {
	return str.includes("-") || str.includes("to");
}

export function connectingWord(data: WorkingData, text: string[]) {
	Logger.trace(`Connecting Word: ${text[data.pos]} for ${data.date}`)
	//If nothing works, try range
	const nextWord = text[data.pos + 1];
	const isBothNumbers = Utility.isNumber(nextWord) && Utility.isNumber(data.date)
	if (isBothNumbers && isConnectingWord(text[data.pos]))
		data = averageRange(data, nextWord)
	return data;
}

export function noMatch(data: WorkingData): WorkingData {
	Logger.trace(`No match was found for ${data.date}`);
	return data;
}
