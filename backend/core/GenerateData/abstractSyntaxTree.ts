import { Post } from "../Types/Post";
import { Utility } from "../Utility/utility";
import { isAD, isBC, isCenturies, isConnectingWord, isSlash, isYearOld } from "./tokens";

interface Tree {
    token: Token,
    child: Tree | undefined,
    trust: number,
}

interface Token {
    token: string,
    word: string,
}

export function ast(posts: Post[]): Post[] {
    for (const post of posts) {
        const text = Utility.sanatizeText(post.text).split(" ");
        const tokens = tokenize(text);
        const result = getDate(tokens);
        console.log(`Result: ${JSON.stringify(result)}`)
        if (result === undefined) continue;
        post.data.date = result.word;

    }
    return posts
}

function getDate(tokens: Token[]) {
    const trees = buildTree(tokens);
    const t = chooseMostTrusted(trees);
    console.log(`Most trusted Tree: ${JSON.stringify(t)}`)
    //return traverseTree(t, t.token);
    return t.token;
}

function buildTree(tokens: Token[]) {
    const trees: Tree[] = [];
    let trust = 0;
    for (const token of tokens) {
        if (token.token === "N") {
            const index = tokens.indexOf(token);
            const newTokens = tokens.slice(index);
            trees.push(buildLeaf(newTokens, trust));
        }   
    }
    trees.filter(x => x.token.token !== "X");
    console.log(`Trees: ${JSON.stringify(trees)}`)
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
        }
    }
    return {
        token: currentToken,
        child: undefined,
        trust: 0,
    };
}

function traverseTree(tree: Tree, token: Token): Token {
    console.log(`Traverse: token: ${tree.token.token} word: ${tree.token.word}`)
    tree.token.word = token.word;
    console.log(`after switch: token: ${tree.token.token} word: ${tree.token.word}`)
    token = calculateToken(tree);
    console.log(`Date: token: ${JSON.stringify(token)}`)
    if (tree.child !== undefined) {
        return traverseTree(tree.child, token);
    }
    console.log(`Return: token: ${JSON.stringify(token)}`)
    return token
}

function getTokens(word: string) {;
    if (Utility.isNumber(word) && word !== "") {
        return "N"
    } else if (isCenturies(word)) {
        return "C";
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
        result.push({ token: token, word: word })
    }
    return result;
}

function calculateToken(tree: Tree) {
    const token = tree.token;
    console.log(`Calc: token: ${token.token} word: ${token.word}`)
    if (token === undefined) return undefined;
    if (token.token === "N") {
        return token;
    } else if (token.token === "C") {
        console.log(`C: ${token.word}`)
        let halfCentury = -50;
        if (token.word.startsWith("-")) halfCentury = 50;
        const nr = +token.word * 100 + halfCentury;
        console.log(`after C calc: ${nr}`)
        return {
            token: "C",
            word: `${nr}`
        };
    } else if (token.token === "Y") {
        return  {
            token: "Y",
            word: `${2023 - +token.word}`
        };
    } else if (token.token === "A") {
        return token;
    } else if (token.token === "B") {
        return  {
            token: "B",
            word: `-${token.word}`,
        }
    } else if (token.token === "S") {
        return {
            token: "S",
            word: slash(tree.child.token.word, token.word),
        }
    } else if (token.token === "W") {
        const futureTree = tree.child.child;
        console.log(`futureTree: ${JSON.stringify(futureTree)} token: ${token.token}`)
        let t = token;
        const saveToken = token;
        if (futureTree === undefined) {
            console.log(`error futureTree: ${JSON.stringify(futureTree)} token: ${token.token}`)
            return token;
        };
        console.log(`includes token ${futureTree.token.token}`)
        if (["C", "M", "A", "B",].includes(futureTree.token.token)) {
            console.log("in if")
            t = traverseTree(futureTree, tree.child.token);
        }
        return {
            token: "N",
            word: connectingWord(saveToken.word, t.word),
        };
    }
}

function chooseMostTrusted(trees: Tree[]) {
	let result: Tree = trees[0];
    let totalTrust: number = 0;
    for (const tree of trees) {
        let currentTree = tree;
        let trust = 1;
        while (currentTree.child !== undefined) {
            trust = currentTree.child.trust;
            currentTree = currentTree.child;
            if (trust > totalTrust) {
                result = tree;
                totalTrust = trust;
            }
        }
    }

	return result;
}

function slash(date: string, secondNum: string) {
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	console.log(`date: ${date}, secondNum: ${secondNum}`)
	const lengthDiff = secondNum.replace("-","").length - date.replace("-", "").length;
	if (lengthDiff > 0) {
		const digits = secondNum.substring(0, lengthDiff);
        console.log(`digits: ${digits}`)
		date = digits + date;
	}
	return Math.round(((+date + +secondNum) / 2)).toString();
}

function connectingWord(date: string, secondNum: string) {
    if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	console.log(`date: ${date}, secondNum: ${secondNum}`)

	return Math.round(((+date + +secondNum) / 2)).toString();
}


// console.log(`Tokens: ${JSON.stringify(tokens)}`)
// //TODO: if includes S or W, change logic
// if (tokens.filter(x => x.token === "S").length > 0) {
//     const index = tokens.findIndex(x => x.token === "W");
//     console.log(`W index: ${index}`)
//     const leftTokens = tokens.slice(0, index);
//     const rightTokens = tokens.slice(index + 1);
//     console.log(`leftTokens: ${JSON.stringify(leftTokens)}`)
//     console.log(`rightTokens: ${JSON.stringify(rightTokens)}`)
//     const leftTree = buildTree(leftTokens);
//     const rightTree = buildTree(rightTokens);

//     return {
//         token: "S",
//         word: "not implemented"
//     }
// }
// if (tokens.filter(x => x.token === "W").length > 0) {
//     if (tokens.filter(x => x.token === "Y").length > 0) 
//         return {
//             token: "Y",
//             word: tokens[tokens.findIndex(x => x.token === "Y")].word,
//         };
//     const index = tokens.findIndex(x => x.token === "W");
//     console.log(`W index: ${index}`)
//     const leftTokens = tokens.slice(0, index);
//     const rightTokens = tokens.slice(index + 1);
//     console.log(`leftTokens: ${JSON.stringify(leftTokens)}`)
//     console.log(`rightTokens: ${JSON.stringify(rightTokens)}`)
//     const leftTree = buildTree(leftTokens);
//     const rightTree = buildTree(rightTokens);
//     //TODO: if right tree is bigger, left tree might need right tree logic
//     console.log(`leftTree: ${JSON.stringify(leftTree)}`)
//     console.log(`rightTree: ${JSON.stringify(rightTree)}`)
//     const l = chooseMostTrusted(leftTree);
//     const r = chooseMostTrusted(rightTree);
//     console.log(`l: ${JSON.stringify(l)}`)
//     console.log(`r: ${JSON.stringify(r)}`)
//     const leftResult = traverseTree(l, l.token);
//     const rightResult = traverseTree(r, r.token);
//     const result = ((+leftResult.word + +rightResult.word) / 2).toString();

//     return {
//         token: "N",
//         word: result,
//     }
// } 