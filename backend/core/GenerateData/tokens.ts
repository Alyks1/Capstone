import { Logger } from "../Utility/logging";
import { WorkingData } from "../Types/WorkingData";

export function notYear(str: string) {
	const shorthand =
		str === "kg" ||
		str === "g" ||
		str === "km" ||
		str === "m" ||
		str === "x" ||
		str === "mm";
	const long =
		str === "kilogram" ||
		str === "gram" ||
		str === "kilometer" ||
		str === "meter";
	return shorthand || long;
}

export function isBC(str: string) {
	return str.includes("bc") || str === "v";
}

export function isAD(str: string) {
	return str.includes("ad") || str === "n";
}

export function isCenturies(str: string) {
	return (
		str === "century" ||
		str === "c" ||
		str === "centuries" ||
		str === "cent" ||
		str === "jh"
	);
}

export function isMillennium(str: string) {
	return str === "millennium" || str === "millenia" || str === "jt";
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}

export function isConnectingWord(str: string) {
	return str === "-" || str === "to" || str === "or";
}

export function isSlash(str: string) {
	return str === "/";
}

export function noMatch(data: WorkingData): WorkingData {
	Logger.trace(`No match was found for ${data.date}`);
	return data;
}
