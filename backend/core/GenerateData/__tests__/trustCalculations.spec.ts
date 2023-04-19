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
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			expect(trust).toEqual(1);
		});
	});
	it("should increase trust for all but index 0", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notBetween0and10 = true;
		const results: number[] = [];
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			results.push(trust);
		});
		expect(results[0]).toEqual(1);
		expect(results[1]).toEqual(2);
	});
	it("should increase trust for only index 0 and 1", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.differentNr = true;
		const results: number[] = [];
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			results.push(trust);
		});
		expect(results[0]).toEqual(2);
		expect(results[1]).toEqual(3);
		expect(results[2]).toEqual(2);
		expect(results[3]).toEqual(2);
	});
	it("should increase trust for all but index 2", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notMultipleOf10and5 = true;
		const results: number[] = [];
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			results.push(trust);
		});
		expect(results[0]).toEqual(3);
		expect(results[1]).toEqual(4);
		expect(results[2]).toEqual(2);
		expect(results[3]).toEqual(3);
	});
	it("should increase trust for all but index 0 and 3", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.notBetween0and100 = true;
		const results: number[] = [];
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			results.push(trust);
		});
		expect(results[0]).toEqual(3);
		expect(results[1]).toEqual(5);
		expect(results[2]).toEqual(3);
		expect(results[3]).toEqual(3);
	});
	it("should decrease trust for all by 2", () => {
		data.forEach((x) => {
			x.trust = 1;
		});
		options.reduceTrust = 2;
		const results: number[] = [];
		data.forEach((x) => {
			const trust = calcTrust(x.trust, x.date, JSON.stringify(options));
			results.push(trust);
		});
		expect(results[0]).toEqual(1);
		expect(results[1]).toEqual(3);
		expect(results[2]).toEqual(1);
		expect(results[3]).toEqual(1);
	});
});
