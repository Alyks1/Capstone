import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";

export interface Token {
	token: string;
	word: string;
}

export function tokenize(text: string[]) {
	const result: Token[] = [];
	for (const word of text) {
		const token = getTokens(word);
		result.push({ token: token, word: word });
	}
	return result;
}

export function calculateToken(token: Token): string {
	Logger.debug(`Calc: token: ${token.token} word: ${token.word}`);
	if (token.token === "N") {
		return token.word;
	} else if (token.token === "C") {
		return century(token.word);
	} else if (token.token === "M") {
		return millennium(token.word);
	} else if (token.token === "Y") {
		return `${2023 - +token.word}`;
	} else if (token.token === "A") {
		return token.word;
	} else if (token.token === "B") {
		return `-${token.word}`;
	} else if (token.token === "S") {
		return token.word;
	}
}

function getTokens(word: string) {
	if (Utility.isNumber(word) && word !== "") {
		return "N";
	} else if (isCenturies(word)) {
		return "C";
	} else if (isMillennium(word)) {
		return "M";
	} else if (isYearOld(word)) {
		return "Y";
	} else if (isAD(word)) {
		return "A";
	} else if (isBC(word)) {
		return "B";
	} else if (isConnectingWord(word)) {
		return "W";
	} else if (isSlash(word)) {
		return "S";
	} else {
		return "X";
	}
}

function isBC(str: string) {
	return str.includes("bc") || str === "v";
}

function isAD(str: string) {
	return str.includes("ad") || str === "n";
}

function isCenturies(str: string) {
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

function isMillennium(str: string) {
	return str === "millennium" || str === "millenia" || str === "jt";
}

export function millennium(date: string) {
	let halfMillennium = -500;
	if (date.startsWith("-")) halfMillennium = 500;
	return (+date * 1000 + halfMillennium).toString();
}

function isYearOld(str: string) {
	return str.includes("year") || str.includes("years");
}

function isConnectingWord(str: string) {
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

function isSlash(str: string) {
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

export const isBCTesting = { isBC };
export const isCenturiesTesting = { isCenturies };
export const isMillenniumTesting = { isMillennium };
export const isConnectingWordTesting = { isConnectingWord };
export const isSlashTesting = { isSlash };
export const isYearOldTesting = { isYearOld };
