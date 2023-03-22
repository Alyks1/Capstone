import { filterData } from "../processData";

//TODO: Add calcTrust tests with mock json

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