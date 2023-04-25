import { Post } from "../Types/Post";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import {
	isAD,
	isBC,
	isCenturies,
	isConnectingWord,
	isMillennium,
	isSlash,
	isYearOld,
} from "./tokens";

interface Tree {
	token: Token;
	child: Tree | undefined;
	trust: number;
}

interface Token {
	token: string;
	word: string;
}

let totalTrust = 0;

export function ast(posts: Post[]): Post[] {
	for (const post of posts) {
		totalTrust = 0;
		Logger.debug(post.text);
		const text = Utility.sanatizeText(post.text).split(" ");
		const tokens = tokenize(text);
		const result = getDate(tokens);
		Logger.info(`Result: ${JSON.stringify(result)}`);
		if (result === undefined) continue;
		post.data.date = result;
		post.data.trust = totalTrust;
	}
	posts = posts.filter((x) => x.data.date !== "");
	return posts;
}

function getDate(tokens: Token[]) {
	const trees = buildTree(tokens);
	if (trees.length === 0) return undefined;
	const tree = chooseMostTrusted(trees);
	Logger.debug(`Most trusted Tree: ${JSON.stringify(tree)}`);
	const result = traverseTree(tree);
	return result;
}

function buildTree(tokens: Token[]) {
	const trees: Tree[] = [];
	const trust = 0;
	for (const token of tokens) {
		if (token.token === "N") {
			const index = tokens.indexOf(token);
			const newTokens = tokens.slice(index);
			trees.push(buildLeaf(newTokens, trust));
		}
	}
	trees.filter((x) => x.token.token !== "X");
	Logger.trace(`Trees: ${JSON.stringify(trees)}`);
	return trees;
}

function buildLeaf(tokens: Token[], trust: number): Tree {
	const currentToken = tokens[0];
	if (!currentToken) return undefined;
	if (currentToken.token === "X") return undefined;
	if (["C", "M", "Y", "A", "B", "N", "S", "W"].includes(currentToken.token)) {
		const left = buildLeaf(tokens.slice(1), ++trust) ?? undefined;
		return {
			token: currentToken,
			child: left,
			trust: trust,
		};
	}
	return {
		token: currentToken,
		child: undefined,
		trust: 0,
	};
}

function traverseTree(tree: Tree): string {
	Logger.trace(`Traverse: ${JSON.stringify(tree)}`);
	let d = calculateToken(tree.token);
	let child = tree.child;
	while (child !== undefined) {
		child.token.word = d;
		if (child.token.token === "W") return handleW(child);
		if (child.token.token === "S") child.token.word = handleS(child);
		d = calculateToken(child.token);
		child = child.child;
	}

	return d;
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

function tokenize(text: string[]) {
	const result: Token[] = [];
	for (const word of text) {
		const token = getTokens(word);
		result.push({ token: token, word: word });
	}
	return result;
}

function calculateToken(token: Token): string {
	Logger.debug(`Calc: token: ${token.token} word: ${token.word}`);
	if (token.token === "N") {
		return token.word;
	} else if (token.token === "C") {
		Logger.trace(`C: ${token.word}`);
		let halfCentury = -50;
		if (token.word.startsWith("-")) halfCentury = 50;
		const nr = +token.word * 100 + halfCentury;
		Logger.trace(`after C calc: ${nr}`);
		return `${nr}`;
	} else if (token.token === "M") {
		Logger.trace(`M: ${token.word}`);
		let halfMillennium = -500;
		if (token.word.startsWith("-")) halfMillennium = 500;
		const nr = +token.word * 1000 + halfMillennium;
		Logger.trace(`after M calc: ${nr}`);
		return `${nr}`;
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

function chooseMostTrusted(trees: Tree[]) {
	let result: Tree = trees[0];
	let total: number = 0;
	for (const tree of trees) {
		let currentTree = tree;
		let trust = 1;
		while (currentTree.child !== undefined) {
			trust = currentTree.child.trust;
			currentTree = currentTree.child;
			if (trust > total) {
				result = tree;
				total = trust;
			}
		}
		totalTrust = total;
	}

	return result;
}

function handleW(currentTree: Tree) {
	Logger.trace(`Handle W: ${JSON.stringify(currentTree)}`);
	if (!currentTree.child) return currentTree.token.word;
	if (currentTree.child.token.token === "Y") {
		return `${2023 - +currentTree.token.word}`;
	}

	const afterWDate = traverseTree(currentTree.child);
	return connectingWord(currentTree.token.word, afterWDate);
}

function handleS(currentTree: Tree) {
	if (!currentTree.child) return currentTree.token.word;
	return slash(currentTree.token.word, currentTree.child.token.word);
}

function slash(date: string, secondNum: string) {
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

function connectingWord(date: string, secondNum: string) {
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	Logger.trace(`date: ${date}, secondNum: ${secondNum}`);
	if (secondNum.startsWith("-")) date = `-${date}`;

	return Math.round((+date + +secondNum) / 2).toString();
}
