import { WorkingData } from "../Types/WorkingData";

export function calcTrust(data: WorkingData[]) {
	data.forEach((x) => {
		//If the date is not between 0 and 100
		if (+x.date < 0 || +x.date > 101) x.trust++;
		//If many different numbers, more precision
		if (new Set([...x.date]).size === x.date.length) x.trust++;
	});
	if (data.length === 1) data[0].trust + 2;
	return data;
}
export function filterData(data: WorkingData[]) {
	//If trust is less than 1, remove
	data = data.filter((x) => x.trust >= 1);
	//If data is above 1940, remove
	data = data.filter((x) => +x.date < 1940);
	return data;
}
export function chooseMostTrusted(data: WorkingData[]) {
	let result: WorkingData = data[0];
	data.forEach((x) => {
		if (x.trust > result.trust) result = x;
	});
	return result;
}
