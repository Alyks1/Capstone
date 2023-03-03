import { Logger } from "../Utility/logging";
import { WorkingData } from "./generateData";

export function isBC(str: string) {
	return str.includes("bc");
}
export function BC(data: WorkingData): WorkingData {
	return { date: `-${data.date}`, trust: data.trust++ };
}

export function isCenturies(str: string) {
	return str.includes("centuries") || str.includes("c");
}
export function centuries(data: WorkingData): WorkingData {
	Logger.trace(`converting ${data.date} to century`);
	const nr = +data.date * 100;
	return { date: `${nr}`, trust: data.trust++ };
}

export function isMillennium(str: string) {
	return str.includes("millennium") || str.includes("millenia");
}
export function millennium(data: WorkingData): WorkingData {
	const nr = +data.date * 1000;
	return { date: `${nr}`, trust: data.trust++ };
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}
export function yearOld(data: WorkingData, now: number): WorkingData {
	return { date: (now - +data.date).toString(), trust: data.trust };
}
