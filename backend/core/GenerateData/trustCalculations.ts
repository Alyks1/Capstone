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
export function calcTrust(
	data: WorkingData[],
	trustCalcOptions = getTrustCalcOptions(),
) {
	const options: TrustCalcOptions = JSON.parse(trustCalcOptions);
	data.forEach((x) => {
		Logger.trace(`Before: ${x.date} : ${x.trust}`);
		//if the date is not between 1 and 10, increase trust
		if (+x.date < 0 || +x.date > 11)
			x.trust = adjustTrust(x.trust, 1, options.notBetween0and10);
		//If many different numbers, more precision, increase trust
		if (new Set([...x.date]).size === x.date.length)
			x.trust = adjustTrust(x.trust, 1, options.differentNr);
		//if the date is not a multiple of 5, more precision, increase trust
		if (+x.date % 5 !== 0)
			x.trust = adjustTrust(x.trust, 1, options.notMultipleOf10and5);
		//If the date is not between 0 and 100 increase trust
		if (+x.date < 0 || +x.date > 101)
			x.trust = adjustTrust(x.trust, 1, options.notBetween0and100);
		//reduce trust by one to stop trust inflation
		Logger.debug(`Reduce trust: ${options.reduceTrust}`);
		x.trust = adjustTrust(x.trust, options.reduceTrust * -1, true);
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

function adjustTrust(trust: number, adjustment: number, active: boolean) {
	if (!active) return trust;
	return trust + adjustment;
}
