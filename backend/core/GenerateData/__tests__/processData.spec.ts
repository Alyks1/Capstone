import {
	addWebsiteWeight,
	chooseMostTrusted,
	filterData,
} from "../processData";

describe("filterData", () => {
	it("Should remove entries with less than 1 trust", () => {
		const data = [
			{
				date: "1889",
				trust: 1,
				pos: 0,
			},
			{
				date: "word",
				trust: 0,
				pos: 0,
			},
		];
		const result = filterData(data);
		expect(result.length).toBe(1);
		expect(result[0].date).toBe("1889");
	});
	it("Should remove entries with dates above 1940", () => {
		const data = [
			{
				date: "1889",
				trust: 1,
				pos: 0,
			},
			{
				date: "2000",
				trust: 1,
				pos: 0,
			},
		];
		const result = filterData(data);
		console.log(result);
		expect(result.length).toBe(1);
		expect(result[0].date).toBe("1889");
	});
});

describe("chooseMostTrusted", () => {
	it("Should return the entry with the highest trust", () => {
		const data = [
			{
				date: "1889",
				trust: 1,
				pos: 0,
			},
			{
				date: "2000",
				trust: 2,
				pos: 0,
			},
		];
		const result = chooseMostTrusted(data);
		expect(result.date).toBe("2000");
	});
});

describe("addWebsiteWeight", () => {
	it("Should multiply the trust with the website weight", () => {
		const data1 = [
			{
				text: "test",
				imgSrc: "test",
				data: {
					date: "1889",
					trust: 1,
					pos: 0,
				},
			},
			{
				text: "test2",
				imgSrc: "test2",
				data: {
					date: "2000",
					trust: 2,
					pos: 0,
				},
			},
		];
		const data2 = [
			{
				text: "test",
				imgSrc: "test",
				data: {
					date: "1889",
					trust: 1,
					pos: 0,
				},
			},
			{
				text: "test2",
				imgSrc: "test2",
				data: {
					date: "2000",
					trust: 2,
					pos: 0,
				},
			},
		];
		const result1 = addWebsiteWeight(data1, 0.5);
		expect(result1[0].data.trust).toBe(1);
		expect(result1[1].data.trust).toBe(1);
		const result2 = addWebsiteWeight(data2, 1);
		expect(result2[0].data.trust).toBe(1);
		expect(result2[1].data.trust).toBe(2);
	});
});
