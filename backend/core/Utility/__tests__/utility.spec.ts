import {Utility} from "../utility";

const testCases = [
    {input: "Clean chars like – and ~", expect: "clean chars like - a -"},
    {input: "Remove punctuation like . , ;", expect: "remove punctuation like   "},
    {input: "Remove img resolution like (1080x960),[1440 x 1080],(1080 x 960),[240×12]", expect: "remove img resolution like "},
    {input: "Remove brackets like () or []", expect: "remove brackets like  or "},
    {input: "Convert BCE or bce", expect: "convert bc or bc"},
    {input: "Convert CE or ce", expect: "convert ad or ad"},
    {input: "Clean numbers like 1st, 2nd, 3rd, 4th etc", expect: "clean numbers like 1 2 3 4 etc"},
    {input: "Convert tO Lowercase", expect: "convert to lowercase"},
]
describe("sanatizeText", () => {
    it("should clean the text", () => {
        testCases.forEach((testCase) => {
            expect(Utility.sanatizeText(testCase.input)).toBe(testCase.expect);
        });
    });
});

describe("isNumber", () => {
    it("should return true for a number", () => {
        expect(Utility.isNumber("1")).toBe(true);
    });
    it("should return false for a string", () => {
        expect(Utility.isNumber("a")).toBe(false);
    });
    it("should return false for a string that contains a number", () => {
        expect(Utility.isNumber("5th")).toBe(false);
    });
});