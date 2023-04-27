import fs from "fs";
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
