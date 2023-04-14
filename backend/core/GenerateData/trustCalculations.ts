import fs from "fs";
import { WorkingData } from "../Types/WorkingData";
import { Logger } from "../Utility/logging";

export interface TrustCalcOptions {
	notBetween0and100: boolean;
	differentNr: boolean;
	multipleOf10and5: boolean;
	between0and10: boolean;
	reduceTrust: number;
}

// rome-ignore lint/style/useConst: these should be updated
let trustCalcOptions: TrustCalcOptions = {
	notBetween0and100: true,
	differentNr: false,
	multipleOf10and5: true,
	between0and10: true,
	reduceTrust: 1,
};

/**
 * Adds or removes trust based on the number properties.
 *
 * - Numbers between 0 and 100 have decreased trust
 * - Many different numbers have increased trust
 * @param data WorkingData array which to calc trust on
 * @returns
 */
export function calcTrust(data: WorkingData[]) {
	getTrustCalcOptions();
	data.forEach((x) => {
		Logger.trace(`Before: ${x.date} : ${x.trust}`);
		//If the date is not between 0 and 100
		if (+x.date < 0 || +x.date > 101)
			x.trust = adjustTrust(x.trust, 1, trustCalcOptions.notBetween0and100);
		//If many different numbers, more precision
		if (new Set([...x.date]).size === x.date.length)
			x.trust = adjustTrust(x.trust, 1, trustCalcOptions.differentNr);
		//if the date is not a multiple of 10 and 5, more precision
		if (+x.date % 10 !== 0 && +x.date % 5 !== 0)
			x.trust = adjustTrust(x.trust, 1, trustCalcOptions.multipleOf10and5);
		//if the date is between 1 and 10, less likely to be a year
		if (+x.date > 0 && +x.date < 11)
			x.trust = adjustTrust(x.trust, 1, trustCalcOptions.between0and10);
		//reduce trust by one to stop trust inflation
		Logger.debug(`Reduce trust: ${trustCalcOptions.reduceTrust}`);
		x.trust = adjustTrust(x.trust, trustCalcOptions.reduceTrust * -1, true);
		return x;
	});
	if (data.length === 1) data[0].trust;
	data.map((x) => {
		Logger.trace(`After: ${x.date} : ${x.trust}`);
		return x;
	});
	return data;
}

export async function setTrustCalcOptions(activations) {
	const jsonData: TrustCalcOptions = {
		notBetween0and100: activations.notBetween0and100,
		differentNr: activations.differentNr,
		multipleOf10and5: activations.multipleOf10and5,
		between0and10: activations.between0and10,
		reduceTrust: activations.reduceTrust,
	};
	const writeData = JSON.stringify(jsonData);
	await fs.promises.writeFile("./trustActivations.json", writeData);
}

export async function getTrustCalcOptions() {
	const buffer = await fs.promises.readFile("./trustActivations.json");
	const data: TrustCalcOptions = JSON.parse(buffer.toString());
	trustCalcOptions.notBetween0and100 = data.notBetween0and100;
	trustCalcOptions.differentNr = data.differentNr;
	trustCalcOptions.multipleOf10and5 = data.multipleOf10and5;
	trustCalcOptions.between0and10 = data.between0and10;
	trustCalcOptions.reduceTrust = Number(data.reduceTrust);

	return JSON.stringify(data);
}

function adjustTrust(trust: number, adjustment: number, active: boolean) {
	if (!active) return trust;
	return trust + adjustment;
}
