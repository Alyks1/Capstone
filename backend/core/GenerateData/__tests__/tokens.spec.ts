import { AD, BC, centuries, isBC, isCenturies, isConnectingWord, isMillennium, isYearOld, millennium, yearOld } from "../tokens";

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

describe("BC", () => {
    it("should return -5 with '5'", () => {
        expect(BC({ date: "5", trust: 0, pos: 0 }).date).toEqual("-5");
    });
});

describe("AD", () => {
    it("should return 1776 with '1776'", () => {
        expect(AD({ date: "1776", trust: 0, pos: 0 }).date).toEqual("1776");
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

describe("centuries", () => {
    it("should return 1750 with '18'", () => {
        expect(centuries({ date: "18", trust: 0, pos: 0 }).date).toEqual("1750");
    });
    it("should return -1850 with '-19'", () => {
        expect(centuries({ date: "-19", trust: 0, pos: 0 }).date).toEqual("-1850");
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

describe("millennium", () => {
    it("should return 1500 with '2'", () => {
        expect(millennium({ date: "2", trust: 0, pos: 0 }).date).toEqual("1500");
    });
    it("should return -2500 with '-3'", () => {
        expect(millennium({ date: "-3", trust: 0, pos: 0 }).date).toEqual("-2500");
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

describe("yearOld", () => {
    it("should return 1 with '2022'", () => {
        expect(yearOld({ date: "2022", trust: 0, pos: 0 }, 2023).date).toEqual("1");
    });
    it("should return -7977 with '10000'", () => {
        expect(yearOld({ date: "10000", trust: 0, pos: 0 }, 2023).date).toEqual("-7977");
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