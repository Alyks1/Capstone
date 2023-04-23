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
        post.data.date = result;

    }
    return posts
}

function getDate(tokens: Token[]) {
    const trees = buildTree(tokens);
    const tree = chooseMostTrusted(trees);
    console.log(`Most trusted Tree: ${JSON.stringify(tree)}`)
    const result = traverseTree(tree);
    return result;
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

function traverseTree(tree: Tree) {
    console.log(`Traverse: ${JSON.stringify(tree)}`)
    //If W exists, split the tree and traverse both sides
    //putting them together at the W pos
    //If, after the split, the right side is longer, then append
    //right side to the left side
    let d = calculateToken(tree.token);
    let child = tree.child;
    while (child !== undefined) {
      child.token.word = d;
      if (child.token.token === "W") return handleW(child, tree);
      if (child.token.token === "S") return handleS(child);
      d = calculateToken(child.token);
      child = child.child;
    }
    
    return d;    
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

function calculateToken(token: Token): string {
    console.log(`Calc: token: ${token.token} word: ${token.word}`)
    if (token.token === "N") {
        return token.word;
    } else if (token.token === "C") {
        console.log(`C: ${token.word}`)
        let halfCentury = -50;
        if (token.word.startsWith("-")) halfCentury = 50;
        const nr = +token.word * 100 + halfCentury;
        console.log(`after C calc: ${nr}`)
        return `${nr}`
    } else if (token.token === "Y") {
        return `${2023 - +token.word}`
    } else if (token.token === "A") {
        return token.word;
    } else if (token.token === "B") {
        return `-${token.word}`
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

function handleW(currentTree: Tree, fullTree: Tree) {
    console.log(`Handle W: ${JSON.stringify(currentTree)}`)
    if (currentTree.child.token.token === "Y") {
        return `${2023 - +currentTree.token.word}`
    }
    //1300 - 1400: currentTree = - 1400, fullTree = 1300 - 1400
    //N W N: currentTree = W N, fullTree = N W N
    //1st - 2nd century: currentTree = - 2nd century, fullTree = 1st - 2nd century
    //N W N C: currentTree = W N C, fullTree = N W N C
    //1st century BC - 2nd century AD: currentTree = BC - 2nd century AD, fullTree = 1st century BC - 2nd century AD
    //N C B W N C A: currentTree = B W N C A, fullTree = N C B W N C A

    //Find W in fullTree
    let current = fullTree;
    while (current.token.token !== "W") {
        current = current.child;
    }
    const afterWDate = traverseTree(current.child);
    return connectingWord(currentTree.token.word, afterWDate);
}

function handleS(currentTree: Tree) {
        return slash(currentTree.token.word, currentTree.child.token.word)
}

function slash(date: string, secondNum: string) {
	if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	console.log(`Slash: date: ${date}, secondNum: ${secondNum}`)
	const lengthDiff = date.replace("-","").length - secondNum.replace("-", "").length;
	if (lengthDiff > 0) {
		const digits = date.substring(0, lengthDiff);
        console.log(`digits: ${digits}`)
		secondNum = digits + secondNum;
	}
    if (date.startsWith("-")) secondNum = `-${secondNum}`;
	return Math.round(((+date + +secondNum) / 2)).toString();
}

function connectingWord(date: string, secondNum: string) {
    if (!Utility.isNumber(secondNum) || !Utility.isNumber(date)) {
		return date;
	}
	console.log(`date: ${date}, secondNum: ${secondNum}`)
    if (secondNum.startsWith("-")) date = `-${date}`;

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