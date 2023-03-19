import { AD, BC, centuries, isBC, isCenturies, isMillennium, millennium } from "../tokens";

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
        expect(BC({ date: "5", trust: 0, pos: 0 })).toEqual({ date: "-5", trust: 2, pos: 0 });
    });
});

describe("AD", () => {
    it("should return 1776 with '1776'", () => {
        expect(AD({ date: "1776", trust: 0, pos: 0 })).toEqual({ date: "1776", trust: 1, pos: 0 });
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
        expect(centuries({ date: "18", trust: 0, pos: 0 })).toEqual({ date: "1750", trust: 2, pos: 0 });
    });
    it("should return -1850 with '-19'", () => {
        expect(centuries({ date: "-19", trust: 0, pos: 0 })).toEqual({ date: "-1850", trust: 2, pos: 0 });
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
        expect(millennium({ date: "2", trust: 0, pos: 0 })).toEqual({ date: "1500", trust: 1, pos: 0 });
    });
    it("should return -2500 with '-3'", () => {
        expect(millennium({ date: "-3", trust: 0, pos: 0 })).toEqual({ date: "-2500", trust: 1, pos: 0 });
    });
});