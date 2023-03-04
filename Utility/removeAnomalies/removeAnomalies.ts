// import { WorkingData } from "../../Types/WorkingData";
// import { Utility } from "../utility";

// export class Anomalies {
// 	/**
// 	 * Removes single char years because they arem ost likely wrong
// 	 *
// 	 * `['10','4th century','5'] => ['10','4th century']`
// 	 * @param data is a string array to filter out single char
// 	 */
// 	static removeSingleCharYears(arr: string[]) {
// 		return arr.filter((x) => x.length > 1);
// 	}

// 	/**
// 	 * Removes years that are above a certain threshold
// 	 *
// 	 * eg: threashold = 1940, `['1636','1950'] => ['1636']`
// 	 * @param arr array to be filtered
// 	 * @param threashold year number upperbound
// 	 */
// 	static removeYearsAboveThreashold(arr: string[], threshold: number) {
// 		//ignores nr above 1940
// 		return arr.filter((x) => +x < threshold);
// 	}

// 	/**
// 	 * Ignores AD years that are too far apart but reduces trust.
// 	 * If the difference between two AD years is greater than a threshold,
// 	 * the entry is skipped and trust is reduced.
// 	 * If the difference is closer than 50, trust is increased.
// 	 * If no conclusion is reached, choses the lowest year and trust is reduces significantly
// 	 * If only one number exists, increase trust.
// 	 *
// 	 * @param data
// 	 * @param threashold
// 	 * @returns
// 	 */
// 	static ignoreYearsToFarApart(data: WorkingData, threshold: number) {
// 		//if any of the WorkingDates numbers start with -, ignore this step

// 		const newData: string[] = [];
// 		const differences = Utility.getDifferences(data.workingDates);

// 		for (let i = 0; i < differences.length; i++) {
// 			//Reduce trust for each skip
// 			if (differences[i] > threshold) {
// 				data.trust--;
// 				continue;
// 			} else if (differences[i] < 50) {
// 				data.trust++;
// 			}
// 			newData[i] = data.workingDates[i];
// 			newData[i + 1] = data.workingDates[i + 1];
// 		}
// 		//What if nothing works eg [1940,1100] ie only continues
// 		if (newData.length === 0) {
// 			const numbers = data.workingDates.map((x) => +x);
// 			//Choose the lowest number (subject to change)
// 			/Add trust to individual data and use that before using the lowest nr
// 			newData[0] = Math.min(...numbers).toString();
// 			//Reduce Trust if a choice had to be made
// 			if (data.workingDates.length !== newData.length)
// 				data.trust = data.trust - 2;
// 			//Increase trust if only one number is found
// 			if (data.workingDates.length === 1) data.trust++;
// 		}
// 		data.workingDates = newData.filter((x) => x);
// 		return data;
// 	}
// }
