import { Post } from "../Types/Post";
import { Utility } from "../Utility/utility";
import { BC, isAD, isBC, isCenturies, isYearOld } from "./tokens";

const tokens: string[] = [];
let index = 0;

export function start(posts: Post[]) {
	for (const post of posts) {
		tokens.length = 0;
		const text = Utility.sanatizeText(post.text).split(" ");
		tokens.push(...tokenize(text));
		const results: string[] = [];
		for (let i = 0; i < text.length; i++) {
			const r = evaluate(tokens[i], text[i]);
			if (tokens[i] === "N") results.push(r);
			index = index + 1;
		}
		const rs = results.filter((x) => x !== undefined);
		console.log(rs);
		//Choose most trusted
		post.data.date = rs[0];
	}
	return posts;
}
function tokenize(text: string[]) {
	const tokens: string[] = [];
	for (const word of text) {
		//Check range first
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
		} else {
			tokens.push("X");
		}
	}
	return tokens;
}

function evaluate(token: string, number: string, accept: string[] = ["N"]) {
	console.log(token, number, accept);
	if (accept.includes(token)) {
		if (token === "N") {
			return evaluate(nextToken(), number, ["A", "B", "C", "Y", "W"]);
		} else if (token === "W") {
			evaluate(nextToken(), number, ["N"]);
		} else if (token === "C") {
			number = evaluate(nextToken(), number, ["A", "B", "W"]);
			let halfCentury = -50;
			if (number.startsWith("-")) halfCentury = 50;
			return +number * 100 + halfCentury;
		} else if (token === "M") {
			number = evaluate(nextToken(), number, ["A", "B", "W"]);
			let halfMillennium = -500;
			if (number.startsWith("-")) halfMillennium = 500;
			return +number * 1000 + halfMillennium;
		} else if (token === "A") {
			number = evaluate(nextToken(), number, ["W"]);
			return number;
		} else if (token === "B") {
			number = evaluate(nextToken(), number, ["W"]);
			return `-${number}`;
		} else if (token === "Y") {
			number = evaluate(nextToken(), number, ["W"]);
			return 2023 - +number;
		}
	}
	return number;
}

function nextToken() {
	index = index + 1;
	return tokens[index];
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

// N
// N A
// N B
// N C
// N Y
// N C A
// N C B
// N C W N C
// N C B W N C A
// N W N
// N W N A
// N W N B
// N W N C
// N W N Y
// N W N C A
// N W N C B
