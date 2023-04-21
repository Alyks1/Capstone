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
        post.data.date = result.word;

    }
    return posts
}

function getDate(tokens: Token[]) {
    console.log(`Tokens: ${JSON.stringify(tokens)}`)
    //TODO: if includes S or W, change logic
    if (tokens.filter(x => x.token === "S").length > 0) {
        return {
            token: "S",
            word: "not implemented"
        }
    }
    if (tokens.filter(x => x.token === "W").length > 0) {
        if (tokens.filter(x => x.token === "Y").length > 0) 
            return {
                token: "Y",
                word: tokens[tokens.findIndex(x => x.token === "Y")].word,
            };
        const index = tokens.findIndex(x => x.token === "W");
        console.log(`W index: ${index}`)
        const leftTokens = tokens.slice(0, index);
        const rightTokens = tokens.slice(index + 1);
        console.log(`leftTokens: ${JSON.stringify(leftTokens)}`)
        console.log(`rightTokens: ${JSON.stringify(rightTokens)}`)
        const leftTree = buildTree(leftTokens);
        const rightTree = buildTree(rightTokens);
        //TODO: if right tree is bigger, left tree might need right tree logic
        console.log(`leftTree: ${JSON.stringify(leftTree)}`)
        console.log(`rightTree: ${JSON.stringify(rightTree)}`)
        const left = leftTree.filter(x => x.token.token !== "X");
        const right = rightTree.filter(x => x.token.token !== "X");
        console.log(`left: ${JSON.stringify(left)}`)
        console.log(`right: ${JSON.stringify(right)}`)
        const l = chooseMostTrusted(left);
        const r = chooseMostTrusted(right);
        console.log(`l: ${JSON.stringify(l)}`)
        console.log(`r: ${JSON.stringify(r)}`)
        const leftResult = traverseTree(l, l.token);
        const rightResult = traverseTree(r, r.token);
        const result = ((+leftResult.word + +rightResult.word) / 2).toString();

        return {
            token: "N",
            word: result,
        }
    } 
    const trees = buildTree(tokens);
    const t = chooseMostTrusted(trees);
    return traverseTree(t, t.token);

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

function buildLeaf(tokens: Token[], trust): Tree {
    const currentToken = tokens[0];
    if (!currentToken) return undefined;
    if (currentToken.token === "X") return undefined;
    if (["C", "M", "Y", "A", "B", "N"].includes(currentToken.token)) {
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
    const date = calculateToken(tree.token);
    if (tree.child !== undefined) {
        return traverseTree(tree.child, token);
    }
    return date
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

function calculateToken(token: Token) {
    console.log(`Calc: token: ${token.token} word: ${token.word}`)
    if (token === undefined) return undefined;
    if (token.token === "N") {
        return token;
    } else if (token.token === "C") {
        let halfCentury = -50;
        if (token.word.startsWith("-")) halfCentury = 50;
        const nr = +token.word * 100 + halfCentury;
        return {
            token: "C",
            word: `${nr}`
        };
    } else if (token.token === "Y") {
        return token = {
            token: "Y",
            word: `${2023 - +token.word}`
        };
    } else if (token.token === "A") {
        return token;
    } else if (token.token === "B") {
        return token =  {
            token: "B",
            word: `-${token.word}`,
        }
    }
}

function chooseMostTrusted(trees: Tree[]) {
	let result: Tree = trees[0];
	trees.forEach((x) => {
		if (x.trust > result.trust) result = x;
	});
	return result;
}