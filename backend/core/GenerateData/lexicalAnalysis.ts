import { Post } from "../Types/Post";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import { isAD, isBC, isCenturies, isConnectingWord, isSlash, isYearOld } from "./tokens";
import { calcTrust } from "./trustCalculations";

const tokens: string[] = [];
const text: string[] = [];
let index = 0;

let newTrust = 0;
//TODO: Test 1758/61 cases not breaking 1st /2nd
//TODO: Fix 1st century BC to 1st century AD
//Century is computed twice. Once for the pass after W,
//Then again on the way back to N before the W
//N1 C B W N2 C A
//goes: N1 C B W -> N1 C A
//				 -> N2 C A
//So path back: A C N2 and A C N1 B C 
//Problem is 1st - 2nd century BC needs to read all the way through
//But 1st century BC - 1st century AD should stop calculating after the -
//TODO: Create "ignore tokens" like kg, cm, m, dynasty, etc

export function start(posts: Post[]) {
	for (const post of posts) {
		reset();
		text.push(...Utility.sanatizeText(post.text).split(" "));
		tokens.push(...tokenize(text));
		Logger.info(text);
		Logger.info(tokens);
		let result = "";
		let trust = 0;
		for (let i = 0; i < text.length; i++) {
			newTrust = 0;
			if (tokens[i] === "N") {
				const r = evaluate(tokens[i], text[i], ["N"]);
				Logger.debug(`Trust before trust calc: ${newTrust}`);
				const t = calcTrust(newTrust, r);
				if (t > trust) {
					Logger.trace(`New result: ${r} with trust: ${t}`);
					trust = t;
					result = r;
				}
			} else {
				index = index + 1;
			}
		}
		if (trust === 0) continue;
		Logger.info(`Final result: ${result} with trust: ${trust}`);
		post.data.date = Math.round(+result).toString();
		post.data.trust = trust;
	}
	posts.filter((x) => x === undefined);
	return posts;
}

function tokenize(text: string[]) {
	const tokens: string[] = [];
	for (const word of text) {
		if (Utility.isNumber(word) && word !== "") {
			tokens.push("N");
		} else if (isCenturies(word)) {
			tokens.push("C");
		} else if (isYearOld(word)) {
			tokens.push("Y");
		} else if (isAD(word)) {
			tokens.push("A");
		} else if (isBC(word)) {
			tokens.push("B");
		} else if (isConnectingWord(word)) {
			tokens.push("W");
		} else if (isSlash(word)) {
			tokens.push("S");
		}
		else {
			tokens.push("X");
		}
	}
	return tokens;
}

function evaluate(token: string, date: string, accept: string[]): string {
	Logger.debug(
		`token: ${token}, date: ${date}, accepting: ${accept}, index: ${index}`,
	);
	if (accept.includes(token)) {
		newTrust++;
		if (token === "N") {
			const r = evaluate(nextToken(), date, ["A", "B", "C", "M", "Y", "W", "S"]);
			return r
		} else if (token === "W") {
			let saveIndex = index;
			if (tokens[index + 1] === "Y") {
				return evaluate(nextToken(), date, ["Y"]);
			}
			date = evaluate(nextToken(), date, ["N", "Y"]);
			index = saveIndex;
			const secondNum = evaluate(nextToken(), text[index], ["N", "Y"]);
			const r = connectingWord(date, secondNum);
			return r
		} else if (token === "C") {
			date = evaluate(nextToken(), date, ["A", "B", "W"]);
			const r = century(date);
			return r
		} else if (token === "M") {
			date = evaluate(nextToken(), date, ["A", "B", "W"]);
			const r = millennium(date);
			return r
		} else if (token === "A") {
			date = evaluate(nextToken(), date, ["W"]);
			return date;
		} else if (token === "B") {	
			return `-${date}`;
		} else if (token === "Y") {
			date = evaluate(nextToken(), date, ["W"]);
			const r = yearOld(date);
			return r
		} else if (token === "S") {
			const saveIndex = index;
			date = evaluate(nextToken(), date, ["N"]);
			index = saveIndex;
			const secondNum = evaluate(nextToken(), text[index], ["N"]);
			const r = slash(date, secondNum);
			return r
		}
	}

	return date
}

function nextToken() {
	index = index + 1;
	return tokens[index];
}

function reset() {
	tokens.length = 0;
	text.length = 0;
	index = 0;
}

function connectingWord(date: string, second: string) {
	Logger.info(`date: ${date}, secondNum: ${second}`);
	if (!Utility.isNumber(second) || !Utility.isNumber(date)) {
		return date;
	}
	const dateNr = +date;
	const secondNr = +second
	const r = ((dateNr + secondNr) / 2).toString();
	console.log(`end of connecting word calc ${r}`)
	return r
}

function slash(date: string, secondNum: string) {
	Logger.debug(`date: ${date}, secondNum: ${secondNum}`);
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	console.log(`date: ${date}, secondNum: ${secondNum}`)
	const lengthDiff = date.replace("-", "").length - secondNum.replace("-","").length;
	if (lengthDiff > 0) {
		const digits = date.substring(0, lengthDiff);
		secondNum = digits + secondNum;
	}
	return ((+date + +secondNum) / 2).toString();
}

function yearOld(date: string) {
	if (!date.match(/\d+/g)) return "";
	const num = date.match(/\d+/g)[0];
	return (2023 - +num).toString();
}

function century(date: string) {
	let halfCentury = -50;
	if (date.startsWith("-")) halfCentury = 50;
	const r = (+date * 100 + halfCentury).toString();
	console.log(`century result ${r}`)
	return r
}

function millennium(date: string) {
	let halfMillennium = -500;
	if (date.startsWith("-")) halfMillennium = 500;
	return (+date * 1000 + halfMillennium).toString();
}

//Tokens:
//N = number
//C = century Word
//M = millennium Word
//Y = year Word
//A = AD
//B = BC
//W = and, or, to, -
//S = /
