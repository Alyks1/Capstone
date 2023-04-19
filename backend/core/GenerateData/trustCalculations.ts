import fs from "fs";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";

export interface TrustCalcOptions {
	notBetween0and100: boolean;
	differentNr: boolean;
	notMultipleOf10and5: boolean;
	notBetween0and10: boolean;
	reduceTrust: number;
}

// rome-ignore lint/style/useConst: these should be updated
let trustCalcOptions: TrustCalcOptions = {
	notBetween0and100: true,
	differentNr: false,
	notMultipleOf10and5: true,
	notBetween0and10: true,
	reduceTrust: 1,
};

/**
 * Adds or removes trust based on the number properties.
 * @param data WorkingData array which to calc trust on
 * @returns
 */
// export function calcTrust(
// 	data: WorkingData[],
// 	trustCalcOptions = getTrustCalcOptions(),
// ) {
// 	const options: TrustCalcOptions = JSON.parse(trustCalcOptions);
// 	data.forEach((x) => {
// 		Logger.trace(`Before: ${x.date} : ${x.trust}`);
// 		//if the date is not between 1 and 10, increase trust
// 		if ((+x.date < 0 || +x.date > 11) && options.notBetween0and10) {
// 			Logger.trace(`Not between 0 and 10: ${x.date}`);
// 			x.trust = adjustTrust(x.trust, 1);
// 		}
// 		//If many different numbers, more precision, increase trust
// 		if (new Set([...x.date]).size === x.date.length && options.differentNr) {
// 			Logger.trace(`Different numbers: ${x.date}`);
// 			x.trust = adjustTrust(x.trust, 1);
// 		}
// 		//if the date is not a multiple of 5, more precision, increase trust
// 		if (+x.date % 5 !== 0 && options.notMultipleOf10and5) {
// 			Logger.trace(`Not multiple of 5: ${x.date}`);
// 			x.trust = adjustTrust(x.trust, 1);
// 		}
// 		//If the date is not between 0 and 100 increase trust
// 		if (+x.date < 0 || (+x.date > 101 && options.notBetween0and100)) {
// 			Logger.trace(`Not between 0 and 100: ${x.date}`);
// 			x.trust = adjustTrust(x.trust, 1);
// 		}
// 		//reduce trust by one to stop trust inflation
// 		Logger.debug(`Reduce trust: ${options.reduceTrust}`);
// 		x.trust = adjustTrust(x.trust, options.reduceTrust * -1);
// 		return x;
// 	});
// 	if (data.length === 1) data[0].trust;
// 	data.map((x) => {
// 		Logger.trace(`After: ${x.date} : ${x.trust}`);
// 		return x;
// 	});
// 	return data;
// }

export function calcTrust(
	trust: number,
	date: string,
	trustCalcOptions = getTrustCalcOptions(),
) {
	const options: TrustCalcOptions = JSON.parse(trustCalcOptions);
	Logger.trace(`Before: ${date} : ${trust}`);
	//if the date is not between 1 and 10, increase trust
	if ((+date < 0 || +date > 11) && options.notBetween0and10) {
		Logger.trace(`Not between 0 and 10: ${date}`);
		trust = adjustTrust(trust, 1);
	}
	//If many different numbers, more precision, increase trust
	if (new Set([...date]).size === date.length && options.differentNr) {
		Logger.trace(`Different numbers: ${date}`);
		trust = adjustTrust(trust, 1);
	}
	//if the date is not a multiple of 5, more precision, increase trust
	if (+date % 5 !== 0 && options.notMultipleOf10and5) {
		Logger.trace(`Not multiple of 5: ${date}`);
		trust = adjustTrust(trust, 1);
	}
	//If the date is not between 0 and 100 increase trust
	if (+date < 0 || (+date > 101 && options.notBetween0and100)) {
		Logger.trace(`Not between 0 and 100: ${date}`);
		trust = adjustTrust(trust, 1);
	}
	//reduce trust by one to stop trust inflation
	Logger.debug(`Reduce trust: ${options.reduceTrust}`);
	trust = adjustTrust(trust, options.reduceTrust * -1);
	return trust;
}

export async function setTrustCalcOptions(activations) {
	const jsonData: TrustCalcOptions = {
		notBetween0and100: activations.notBetween0and100,
		differentNr: activations.differentNr,
		notMultipleOf10and5: activations.notMultipleOf10and5,
		notBetween0and10: activations.notBetween0and10,
		reduceTrust: activations.reduceTrust,
	};
	const writeData = JSON.stringify(jsonData);
	await fs.promises.writeFile("./trustActivations.json", writeData);
}

export function getTrustCalcOptions() {
	const buffer = fs.readFileSync("./trustActivations.json");
	const data: TrustCalcOptions = JSON.parse(buffer.toString());
	trustCalcOptions.notBetween0and100 = data.notBetween0and100;
	trustCalcOptions.differentNr = data.differentNr;
	trustCalcOptions.notMultipleOf10and5 = data.notMultipleOf10and5;
	trustCalcOptions.notBetween0and10 = data.notBetween0and10;
	trustCalcOptions.reduceTrust = Number(data.reduceTrust);

	return JSON.stringify(data);
}

function adjustTrust(trust: number, adjustment: number) {
	return trust + adjustment;
}
