import { ast } from "../abstractSyntaxTree";

const data = [
	{
		text: "A painting of a bear from the Chauvet Caves, France 30,000 BCE [1920x1124]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "Temple of Valadier built in 1827 in the entrance of the Frasassi caves in Genga, Italy [720x917]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "Ring with figure of seated cat. 18th Dynasty, ca. 1390 BC. Egyptian faience. Art Institute of Chicago. X80 [2048x1844]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "Female torso, probably Queen Nefertiti, Amarna period (1365-1349 BC) New Kingdom. (714x1024)",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "Inky paw prints left by a curious kitty on a 15th century manuscript from Dubrovnik, Croatia [3072x2304]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "An almost 2,000-year-old Roman road discovered by archaeologists at the construction site of the A3 motorway. This great find was made in Sălaj County, located in north-western Romania (Krisana and Transylvania). [720x960]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "The mètre étalon is a small shelf of marble installed beneath the arcade at 36 rue Vaugirard in Paris. After the Académie des Sciences defined the meter for the first time on March 1791, 16 of these were set in Paris between 1796-1797 so that people could familiarize with the new measure [4032x3024]",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "Späte 6. Dynastie, ca. 2200-2191 v. Chr., Giza, Mastaba des Schepses-ptah (S 338/339), westlicher Serdab",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "VIENNA VIEWED FROM THE BELVEDERE PALACE 1758/61 Artist: Bernardo Bellotto, gen. Canaletto",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "1st century BC to 1st century AD From Alexandria",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "1st / 2nd century AD from Egypt",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
	{
		text: "2st - 3nd century AD from Egypt",
		imgSrc: "test",
		date: "",
		trust: 0,
	},
];

const expected = [
	{
		text: "A painting of a bear from the Chauvet Caves, France 30,000 BCE [1920x1124]",
		imgSrc: "test",
		date: "-30000",
		trust: 0,
	},
	{
		text: "Temple of Valadier built in 1827 in the entrance of the Frasassi caves in Genga, Italy [720x917]",
		imgSrc: "test",
		date: "1827",
		trust: 0,
	},
	{
		text: "Ring with figure of seated cat. 18th Dynasty, ca. 1390 BC. Egyptian faience. Art Institute of Chicago. X80 [2048x1844]",
		imgSrc: "test",
		date: "-1390",
		trust: 0,
	},
	{
		text: "Female torso, probably Queen Nefertiti, Amarna period (1365-1349 BC) New Kingdom. (714x1024)",
		imgSrc: "test",
		date: "-1357",
		trust: 0,
	},
	{
		text: "Inky paw prints left by a curious kitty on a 15th century manuscript from Dubrovnik, Croatia [3072x2304]",
		imgSrc: "test",
		date: "1450",
		trust: 0,
	},
	{
		text: "An almost 2,000-year-old Roman road discovered by archaeologists at the construction site of the A3 motorway. This great find was made in Sălaj County, located in north-western Romania (Krisana and Transylvania). [720x960]",
		imgSrc: "test",
		date: "23",
		trust: 0,
	},
	{
		text: "The mètre étalon is a small shelf of marble installed beneath the arcade at 36 rue Vaugirard in Paris. After the Académie des Sciences defined the meter for the first time on March 1791, 16 of these were set in Paris between 1796-1797 so that people could familiarize with the new measure [4032x3024]",
		imgSrc: "test",
		date: "1797",
		trust: 0,
	},
	{
		text: "Späte 6. Dynastie, ca. 2200-2191 v. Chr., Giza, Mastaba des Schepses-ptah (S 338/339), westlicher Serdab",
		imgSrc: "test",
		date: "-2195",
		trust: 0,
	},
	{
		text: "VIENNA VIEWED FROM THE BELVEDERE PALACE 1758/61 Artist: Bernardo Bellotto, gen. Canaletto",
		imgSrc: "test",
		date: "1760",
		trust: 0,
	},
	{
		text: "1st century BC to 1st century AD From Alexandria",
		imgSrc: "test",
		date: "0",
		trust: 0,
	},
	{
		text: "1st / 2nd century AD from Egypt",
		imgSrc: "test",
		date: "150",
		trust: 0,
	},
	{
		text: "2st - 3nd century AD from Egypt",
		imgSrc: "test",
		date: "200",
		trust: 0,
	},
];

describe("abstract syntax tree", () => {
	const result = ast(data);
	it("should return the correct date", () => {
		result.forEach((x, i) => {
			expect(x.date).toBe(expected[i].date);
		});
	});
});
