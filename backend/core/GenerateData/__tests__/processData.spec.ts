import { calcTrust, filterData, chooseMostTrusted, addWebsiteWeight } from "../processData";

describe("calcTrust", () => {
    it("Should increase trust if the date is not between 0 and 100", () => {
        const data = [
            {
                date: "1889",
                trust: 0,
                pos: 0,
            },
            {
                date: "50",
                trust: 0,
                pos: 0,
            },
        ];
        const result = calcTrust(data);
        expect(result[0].trust).toBe(2);
        expect(result[0].date).toBe("1889");
        expect(result[1].trust).toBe(1);
    });
    it("Should increase trust if many different numbers", () => {
        const data = [
            {
                date: "1859",
                trust: 0,
                pos: 0,
            },
            {
                date: "2000",
                trust: 0,
                pos: 0,
            },
        ];
        const result = calcTrust(data);
        expect(result[0].trust).toBe(3);
        expect(result[1].trust).toBe(1);
    });
    it("Should increase trust if only one entry", () => {
        const data = [
            {
                date: "1889",
                trust: 0,
                pos: 0,
            },
        ];
        const result = calcTrust(data);
        expect(result[0].trust).toBe(2);
    });
});

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