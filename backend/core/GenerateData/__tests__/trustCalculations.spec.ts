import { calcTrust, trustCalcOptions } from "../trustCalculations";

const options = { ...trustCalcOptions };

describe("calcTrust", () => {
	const data = [
		{
			date: "5",
			trust: 1,
			pos: 0,
		},
		{
			date: "1234",
			trust: 1,
			pos: 0,
		},
		{
			date: "1000",
			trust: 1,
			pos: 0,
		},
		{
			date: "50",
			trust: 1,
			pos: 0,
		},
	];
	it("should calc with all options off", () => {
		options.between0and10 = false;
		options.differentNr = false;
		options.multipleOf10and5 = false;
		options.notBetween0and100 = false;
		options.reduceTrust = 0;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(1);
		expect(result[0].trust).toEqual(1);
	});
});
