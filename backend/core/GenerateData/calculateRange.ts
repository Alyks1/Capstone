import { Logger } from "../Utility/logging";
import { Utility } from "../Utility/utility";
import { BC, isBC } from "./tokens";
import { WorkingData } from "../Types/WorkingData";

export function isRange(str: string) {
	const hasHyphen = str.includes("-");
	const hasYear = str.includes("year") || str.includes("years");
	const hasNumbers = /[0-9]+/.test(str);
	return hasHyphen && hasNumbers && !hasYear;
}
export function averageRange(data: WorkingData, nextWord: string): WorkingData {
	Logger.trace(`Averaging range: ${data.date}, potentially with ${nextWord}`);
	const bothNrs = chooseRange(data, nextWord);
	const numbers = convertToNumbers(bothNrs, data);
	const total = numbers.reduce((acc: number, x: number) => x + acc, 0);
	return {
		date: (total / numbers.length).toString(),
		trust: ++data.trust,
		pos: data.pos,
	};
}

function chooseRange(data: WorkingData, nextWord: string) {
	//before split, check if nextWord is a nr
	//if it is, use that number for calc
	//otherwise split the existing string.
	//This needs to be done to avoid accidentaly splitting negative numbers
	let bothNrs: string[] = [];
	if (Utility.isNumber(nextWord) && nextWord.length > 0) {
		bothNrs.push(data.date);
		bothNrs.push(nextWord);
	} else {
		//check if data.date has multiple - in it
		//if it does, split on the last one
		//otherwise split on the first one
		const hyphens = data.date.match(/-/g);
		if (hyphens?.length > 1) {
			const lastHyphen = data.date.lastIndexOf("-");
			bothNrs.push(data.date.slice(0, lastHyphen));
			bothNrs.push(data.date.slice(lastHyphen + 1));
		} else bothNrs = data.date.split("-"); 
	}
	Logger.info(`Both nrs = ${bothNrs}`);
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

export const chooseRangeTesting = { chooseRange };
export const convertToNumbersTesting = { convertToNumbers };
