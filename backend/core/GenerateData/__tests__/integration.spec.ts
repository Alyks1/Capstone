import { getDateFromPosts } from "../generateData";
import { start } from "../lexicalAnalysis";

const data = [
	{
		text: "A painting of a bear from the Chauvet Caves, France 30,000 BCE [1920x1124]",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Temple of Valadier built in 1827 in the entrance of the Frasassi caves in Genga, Italy [720x917]",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Ring with figure of seated cat. 18th Dynasty, ca. 1390 BC. Egyptian faience. Art Institute of Chicago. X80 [2048x1844]",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Female torso, probably Queen Nefertiti, Amarna period (1365-1349 BC) New Kingdom. (714x1024)",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Inky paw prints left by a curious kitty on a 15th century manuscript from Dubrovnik, Croatia [3072x2304]",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "An almost 2,000-year-old Roman road discovered by archaeologists at the construction site of the A3 motorway. This great find was made in Sălaj County, located in north-western Romania (Krisana and Transylvania). [720x960]",
		imgSrc: "test",
		data: {
			date: "",
			trust: 0,
			pos: 0,
		},
	},
];

const expected = [
	{
		text: "A painting of a bear from the Chauvet Caves, France 30,000 BCE [1920x1124]",
		imgSrc: "test",
		data: {
			date: "-30000",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Temple of Valadier built in 1827 in the entrance of the Frasassi caves in Genga, Italy [720x917]",
		imgSrc: "test",
		data: {
			date: "1827",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Ring with figure of seated cat. 18th Dynasty, ca. 1390 BC. Egyptian faience. Art Institute of Chicago. X80 [2048x1844]",
		imgSrc: "test",
		data: {
			date: "-1390",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Female torso, probably Queen Nefertiti, Amarna period (1365-1349 BC) New Kingdom. (714x1024)",
		imgSrc: "test",
		data: {
			date: "-1357",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "Inky paw prints left by a curious kitty on a 15th century manuscript from Dubrovnik, Croatia [3072x2304]",
		imgSrc: "test",
		data: {
			date: "1450",
			trust: 0,
			pos: 0,
		},
	},
	{
		text: "An almost 2,000-year-old Roman road discovered by archaeologists at the construction site of the A3 motorway. This great find was made in Sălaj County, located in north-western Romania (Krisana and Transylvania). [720x960]",
		imgSrc: "test",
		data: {
			date: "23",
			trust: 0,
			pos: 0,
		},
	},
];

// describe("GenerateData", () => {
// 	const result = getDateFromPosts(data);
// 	it("should return the correct date", () => {
// 		expect(result[0].data.date).toEqual(expected[0].data.date);
// 		expect(result[1].data.date).toEqual(expected[1].data.date);
// 		expect(result[2].data.date).toEqual(expected[2].data.date);
// 		expect(result[3].data.date).toEqual(expected[3].data.date);
// 	});
// });

describe("lexicalAnalyis", () => {
	const result = start(data);
	it("should return the correct date", () => {
		expect(result[0].data.date).toEqual(expected[0].data.date);
		expect(result[1].data.date).toEqual(expected[1].data.date);
		expect(result[2].data.date).toEqual(expected[2].data.date);
		expect(result[3].data.date).toEqual(expected[3].data.date);
		expect(result[4].data.date).toEqual(expected[4].data.date);
		expect(result[5].data.date).toEqual(expected[5].data.date);
	});
});
