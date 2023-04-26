import { Post } from "../Types/Post";
import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import {
	Token,
	calculateToken,
	century,
	connectingWord,
	slash,
	tokenize,
} from "./tokens";
import { calcTrust } from "./trustCalculations";

interface Tree {
	token: Token;
	child: Tree | undefined;
	trust: number;
}

let totalTrust = 0;

export function ast(posts: Post[]): Post[] {
	for (const post of posts) {
		totalTrust = 0;
		Logger.debug(post.text);
		const text = Utility.sanatizeText(post.text).split(" ");
		const tokens = tokenize(text);
		let result = getDate(tokens);
		Logger.info(`Result: ${JSON.stringify(result)}`);
		if (+result > 1940) result = undefined;
		if (result === undefined) continue;
		const trust = calcTrust(totalTrust, result);
		post.date = result;
		post.trust = trust;
	}
	posts = posts.filter((x) => x.date !== "");
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
		if (child.token.token === "W") return handleW(child, tree);
		if (child.token.token === "S") child.token.word = handleS(child);
		d = calculateToken(child.token);
		child = child.child;
	}

	return d;
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

function handleW(currentTree: Tree, fullTree: Tree) {
	Logger.trace(`Handle W: ${JSON.stringify(currentTree)}`);
	if (!currentTree.child) return currentTree.token.word;
	if (currentTree.child.token.token === "Y") {
		return `${2023 - +currentTree.token.word}`;
	}

	//Check if a century has been applied already
	let current = fullTree;
	let hasCentury = false;
	while (current.token.token !== "W") {
		if (current.token.token === "C") hasCentury = true;
		current = current.child;
	}

	let firstDate = currentTree.token.word;
	const saveDate = currentTree.child.token.word;
	const secondDate = traverseTree(currentTree.child);

	//Check if a century has been applied, needs to ignore '-' so not to have to check for BC
	const willBeCentury =
		century(saveDate).replace("-", "") === secondDate.replace("-", "");

	if (willBeCentury && !hasCentury) {
		firstDate = century(firstDate);
	}

	return connectingWord(firstDate, secondDate);
}

function handleS(currentTree: Tree) {
	if (!currentTree.child) return currentTree.token.word;
	return slash(currentTree.token.word, currentTree.child.token.word);
}
