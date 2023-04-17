import { TrustCalcOptions, calcTrust } from "../trustCalculations";

const options: TrustCalcOptions = {
	notBetween0and10: false,
	differentNr: false,
	notMultipleOf10and5: false,
	notBetween0and100: false,
	reduceTrust: 0,
};

describe("calcTrust", () => {
	const data = [
		{
			date: "6",
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
			date: "66",
			trust: 1,
			pos: 0,
		},
	];
	it("should calc with all options off", () => {
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(1);
		expect(result[1].trust).toEqual(1);
		expect(result[2].trust).toEqual(1);
		expect(result[3].trust).toEqual(1);
	});
	it("should increase trust for all but index 0", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notBetween0and10 = true;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(1);
		expect(result[1].trust).toEqual(2);
		expect(result[2].trust).toEqual(2);
		expect(result[3].trust).toEqual(2);
	});
	it("should increase trust for only index 0 and 1", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.differentNr = true;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(2);
		expect(result[1].trust).toEqual(3);
		expect(result[2].trust).toEqual(2);
		expect(result[3].trust).toEqual(2);
	});
	it("should increase trust for all but index 2", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notMultipleOf10and5 = true;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(3);
		expect(result[1].trust).toEqual(4);
		expect(result[2].trust).toEqual(2);
		expect(result[3].trust).toEqual(3);
	});
	it("should increase trust for all but index 0 and 3", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notBetween0and100 = true;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(3);
		expect(result[1].trust).toEqual(5);
		expect(result[2].trust).toEqual(3);
		expect(result[3].trust).toEqual(3);
	});
	it("should decrease trust for all by 2", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.reduceTrust = 2;
		const result = calcTrust(data, JSON.stringify(options));
		expect(result[0].trust).toEqual(1);
		expect(result[1].trust).toEqual(3);
		expect(result[2].trust).toEqual(1);
		expect(result[3].trust).toEqual(1);
	});
});
