import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import { BC, isBC } from "./tokens";
import { WorkingData } from "../Types/WorkingData";

export function isRange(str: string) {
	const hasHyphen = str.includes("-");
	const hasNumbers = str.match(/[0-9]+/);
	return hasHyphen && hasNumbers;
}
export function averageRange(data: WorkingData, nextWord: string): WorkingData {
	Logger.trace(`Averaging range: ${data.date}, potentially with ${nextWord}`);
	const bothNrs = chooseRange(data, nextWord);
	const numbers = convertToNumbers(bothNrs, data);
	const total = numbers.reduce((acc: number, x: number) => +x + acc, 0);
	return {
		date: (total / numbers.length).toString(),
		trust: data.trust++,
		pos: data.pos,
	};
}

function chooseRange(data: WorkingData, nextWord: string) {
	//before split, check if nextWord is a nr
	//if it is, use that number for calc
	//otherwise split the existing string.
	//This needs to be done to avoid accidentaly splitting negative numbers
	let bothNrs: string[] = [];
	if (Utility.isNumber(nextWord)) {
		bothNrs.push(data.date);
		bothNrs.push(nextWord);
	} else bothNrs = data.date.split("-");
	Logger.trace(`Both nrs = ${bothNrs}`);
	return bothNrs;
}

function convertToNumbers(arr: string[], data: WorkingData) {
	const matchNrs = /[0-9]+/g;
	const numbers: number[] = arr.map((x) => {
		if (Utility.isNumber(x)) return +x;
		const match = (x.match(matchNrs) ?? [""])[0];
		if (isBC(x))
			return +BC({ date: match, trust: data.trust, pos: data.pos }).date;
		return +match;
	});
	return numbers;
}
