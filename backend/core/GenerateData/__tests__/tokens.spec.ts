import {
	isBCTesting,
	isCenturiesTesting,
	isConnectingWordTesting,
	isMillenniumTesting,
	isYearOldTesting,
	isSlashTesting,
	slash,
	century,
	millennium,
	connectingWord,
} from "../tokens";

const { isBC } = isBCTesting;
const { isCenturies } = isCenturiesTesting;
const { isConnectingWord } = isConnectingWordTesting;
const { isMillennium } = isMillenniumTesting;
const { isYearOld } = isYearOldTesting;
const { isSlash } = isSlashTesting;

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

describe("isSlash", () => {
	it("should return true with '/'", () => {
		expect(isSlash("/")).toBe(true);
	});
	it("should return false with '5'", () => {
		expect(isSlash("5")).toBe(false);
	});
	it("should return false with 'word'", () => {
		expect(isSlash("word")).toBe(false);
	});
});

describe("slash", () => {
	it("should return '1760' with '1758' and '1761'", () => {
		expect(slash("1758", "1761")).toBe("1760");
	});
	it("should return '1760' with '1758' and '61'", () => {
		expect(slash("1758", "61")).toBe("1760");
	});
});

describe("century", () => {
	it("should return '1850' with '19'", () => {
		expect(century("19")).toBe("1850");
	});
	it("should return '-150' with '-2'", () => {
		expect(century("-2")).toBe("-150");
	});
});

describe("millennium", () => {
	it("should return '1500' with '2'", () => {
		expect(millennium("2")).toBe("1500");
	});
	it("should return '-1500' with '-2'", () => {
		expect(millennium("-2")).toBe("-1500");
	});
});

describe("connectingWord", () => {
	it("should return '0' with '-1' and '1'", () => {
		expect(connectingWord("-1", "1")).toBe("0");
	});
	it("should return '1650' with '1600' and '1700'", () => {
		expect(connectingWord("1600", "1700")).toBe("1650");
	});
});
