import { Post } from "../Types/Post";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import { isAD, isBC, isCenturies, isConnectingWord, isYearOld } from "./tokens";
import { calcTrust } from "./trustCalculations";

const tokens: string[] = [];
const text: string[] = [];
let index = 0;

let newTrust = 0;

export function start(posts: Post[]) {
	for (const post of posts) {
		console.log("##########################");
		tokens.length = 0;
		text.length = 0;
		index = 0;
		text.push(...Utility.sanatizeText(post.text).split(" "));
		tokens.push(...tokenize(text));
		let result = "";
		let trust = 0;
		for (let i = 0; i < text.length; i++) {
			newTrust = 0;
			if (tokens[i] === "N") {
				const r = evaluate(tokens[i], text[i], ["N"]);
				const t = calcTrust(newTrust, r);
				if (t > trust) {
					console.log(`New result: ${r} with trust: ${t}`);
					trust = t;
					result = r;
				}
			} else {
				index = index + 1;
			}
		}
		console.log(text);
		console.log(tokens);
		console.log(result);
		post.data.date = result;
	}
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
		} else {
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
			return evaluate(nextToken(), date, ["A", "B", "C", "M", "Y", "W"]);
		} else if (token === "W") {
			//Save current pos
			const saveIndex = index + 1;
			date = evaluate(nextToken(), date, ["N", "Y"]);
			return connectingWord(date, saveIndex);
		} else if (token === "C") {
			date = evaluate(nextToken(), date, ["A", "B", "W"]);
			return century(date);
		} else if (token === "M") {
			date = evaluate(nextToken(), date, ["A", "B", "W"]);
			return millennium(date);
		} else if (token === "A") {
			date = evaluate(nextToken(), date, ["W"]);
			return date;
		} else if (token === "B") {
			date = evaluate(nextToken(), date, ["W"]);
			return `-${date}`;
		} else if (token === "Y") {
			date = evaluate(nextToken(), date, ["W"]);
			return yearOld(date);
		}
	}
	return date;
}

function nextToken() {
	index = index + 1;
	return tokens[index];
}

function connectingWord(date: string, saveIndex: number) {
	//date + second number
	//second number needs to be gotten from text[index - 1] or text[index - 2] or text[index - 3]
	//depending on the depth of the recursion
	//Get level of recursion
	const indexDiff = index - saveIndex;
	//Get second number based on recursion level
	let secondNum = text[index - indexDiff];
	//Handle BC
	if (+date < 0) secondNum = `-${secondNum}`;
	//Handle year old
	if (!Utility.isNumber(secondNum)) {
		Logger.debug("Going from connecting word to year old");
		return date;
	}
	return ((+date + +secondNum) / 2).toString();
}

function yearOld(date: string) {
	const num = date.match(/\d+/g)[0];
	return (2023 - +num).toString();
}

function century(date: string) {
	let halfCentury = -50;
	if (date.startsWith("-")) halfCentury = 50;
	return (+date * 100 + halfCentury).toString();
}

function millennium(date: string) {
	let halfMillennium = -500;
	if (date.startsWith("-")) halfMillennium = 500;
	return (+date * 1000 + halfMillennium).toString();
}

//[X,X,X,X, N, B, X, X, X]
//Tokens:
//N = number
//C = century Word
//M = millennium Word
//Y = year Word
//A = AD
//B = BC
//W = and, or, to, -
