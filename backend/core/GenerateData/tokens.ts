import { Logger } from "../Utility/logging";
import { WorkingData } from "../Types/WorkingData";

export function isBC(str: string) {
	return str.includes("bc");
}
export function BC(data: WorkingData): WorkingData {
	return { date: `-${data.date}`, trust: data.trust + 2, pos: data.pos };
}
export function AD(data: WorkingData): WorkingData {
	data.trust = data.trust+1;
	return data;
}

export function isCenturies(str: string) {
	return str === "century" || str === "c";
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
	return { date: `${nr}`, trust: data.trust + 2, pos: data.pos };
}

export function isMillennium(str: string) {
	return str === "millennium" || str === "millenia";
}
export function millennium(data: WorkingData): WorkingData {
	var halfMillennium = -500;
	if (data.date.startsWith("-")) halfMillennium = 500;
	const nr = (+data.date * 1000) + halfMillennium;

	return { date: `${nr}`, trust: data.trust+1, pos: data.pos };
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}
export function yearOld(data: WorkingData, now: number): WorkingData {
	return {
		date: (now - +data.date).toString(),
		trust: data.trust+1,
		pos: data.pos,
	};
}

export function isConnectingWord(str: string) {
	return str.includes("-") || str.includes("to");
}

export function noMatch(data: WorkingData): WorkingData {
	Logger.trace(`No match was found for ${data.date}`);
	return data;
}
