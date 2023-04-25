import { addWebsiteWeight } from "../processData";

describe("addWebsiteWeight", () => {
	it("Should multiply the trust with the website weight", () => {
		const data1 = [
			{
				text: "test",
				imgSrc: "test",
				date: "1889",
				trust: 1,
			},
			{
				text: "test2",
				imgSrc: "test2",
				date: "2000",
				trust: 2,
			},
		];
		const data2 = [
			{
				text: "test",
				imgSrc: "test",
				date: "1889",
				trust: 1,
			},
			{
				text: "test2",
				imgSrc: "test2",
				date: "2000",
				trust: 2,
			},
		];
		const result1 = addWebsiteWeight(data1, 0.5);
		expect(result1[0].trust).toBe(1);
		expect(result1[1].trust).toBe(1);
		const result2 = addWebsiteWeight(data2, 1);
		expect(result2[0].trust).toBe(1);
		expect(result2[1].trust).toBe(2);
	});
});
