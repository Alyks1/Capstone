import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";

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

export function century(date: string) {
	let halfCentury = -50;
	if (date.startsWith("-")) halfCentury = 50;
	return (+date * 100 + halfCentury).toString();
}

export function isMillennium(str: string) {
	return str === "millennium" || str === "millenia" || str === "jt";
}

export function millenium(date: string) {
	let halfMillennium = -500;
	if (date.startsWith("-")) halfMillennium = 500;
	return (+date * 1000 + halfMillennium).toString();
}

export function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}

export function isConnectingWord(str: string) {
	return str === "-" || str === "to" || str === "or";
}

export function connectingWord(date: string, secondNum: string) {
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	Logger.trace(`date: ${date}, secondNum: ${secondNum}`);
	if (secondNum.startsWith("-")) date = `-${date}`;

	return Math.round((+date + +secondNum) / 2).toString();
}

export function isSlash(str: string) {
	return str === "/";
}

export function slash(date: string, secondNum: string) {
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	Logger.trace(`Slash: date: ${date}, secondNum: ${secondNum}`);
	const lengthDiff =
		date.replace("-", "").length - secondNum.replace("-", "").length;
	if (lengthDiff > 0) {
		const digits = date.substring(0, lengthDiff);
		Logger.trace(`digits: ${digits}`);
		secondNum = digits + secondNum;
	}
	if (date.startsWith("-")) secondNum = `-${secondNum}`;
	return Math.round((+date + +secondNum) / 2).toString();
}
