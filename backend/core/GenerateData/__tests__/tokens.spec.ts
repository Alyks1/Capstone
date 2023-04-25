import {
	isBC,
	isCenturies,
	isConnectingWord,
	isMillennium,
	isYearOld,
} from "../tokens";

describe("isBC", () => {
	it("should return true with '5bc'", () => {
		expect(isBC("5bc")).toBe(true);
	});
	it("should return false with '5ad'", () => {
		expect(isBC("5ad")).toBe(false);
	});
	it("should return true with 'bc'", () => {
		expect(isBC("bc")).toBe(true);
	});
});

describe("isCenturies", () => {
	it("should return true with 'century'", () => {
		expect(isCenturies("century")).toBe(true);
	});
	it("should return true with 'c'", () => {
		expect(isCenturies("c")).toBe(true);
	});
	it("should return false with '5'", () => {
		expect(isCenturies("5")).toBe(false);
	});
});

describe("isMillennium", () => {
	it("should return true with 'millennium'", () => {
		expect(isMillennium("millennium")).toBe(true);
	});
	it("should return true with 'millenia'", () => {
		expect(isMillennium("millenia")).toBe(true);
	});
	it("should return false with '5'", () => {
		expect(isMillennium("5")).toBe(false);
	});
});

describe("isYearOld", () => {
	it("should return true with 'year'", () => {
		expect(isYearOld("year")).toBe(true);
	});
	it("should return true with 'years'", () => {
		expect(isYearOld("years")).toBe(true);
	});
	it("should return false with '5'", () => {
		expect(isYearOld("5")).toBe(false);
	});
});

describe("isConnectingWord", () => {
	it("should return true with '-'", () => {
		expect(isConnectingWord("-")).toBe(true);
	});
	it("should return true with 'to'", () => {
		expect(isConnectingWord("to")).toBe(true);
	});
	it("should return false with '5'", () => {
		expect(isConnectingWord("5")).toBe(false);
	});
	it("should return false with 'word'", () => {
		expect(isConnectingWord("word")).toBe(false);
	});
});
