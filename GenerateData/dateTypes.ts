import { Logger } from "../Utility/logging";
import { WorkingData } from "../Types/WorkingData";

export function isBC(str: string) {
	return str.includes("bc");
}
export function BC(data: WorkingData): WorkingData {
	return { date: `-${data.date}`, trust: data.trust + 2, pos: data.pos };
}
export function AD(data: WorkingData): WorkingData {
	data.trust++;
	return data;
}

export function isCenturies(str: string) {
	return str === "century" || str === "c";
}
export function centuries(data: WorkingData): WorkingData {
	//TODO: Treat centuries and millenium as ranges ie 13th century is 1200-1300
	Logger.trace(`converting ${data.date} to century`);
	const nr = (+data.date - 1) * 100;
	return { date: `${nr}`, trust: data.trust + 2, pos: data.pos };
}

export function isMillennium(str: string) {
	return str === "millennium" || str === "millenia";
}
export function millennium(data: WorkingData): WorkingData {
	const nr = (+data.date - 1) * 1000;
	return { date: `${nr}`, trust: data.trust++, pos: data.pos };
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}
export function yearOld(data: WorkingData, now: number): WorkingData {
	return {
		date: (now - +data.date).toString(),
		trust: data.trust++,
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
