import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { WorkingData } from "./Types/WorkingData";

//Within 100 years difference allow a range to be calculated
const AD_TIME_INTERVAL = 100;

export async function CreateDataSetFromPost(posts: Post[], page: Page) {
    //Goto each imageSrc and screenshot/pdf it
    //Use text as name
    //There must be a better way to do this but here we are
    for (let post of posts) {
        //TODO: Fix this
        const dates = extractDates(post.text);
        if (dates.length <= 0) continue;

        const filename = evaluateDates(dates);

        //Use fetch to download img
        await page.goto(post.imgSrc);
        await page.pdf({ path: `./Images/${filename}.pdf` })
    };
}

function extractDates(text: string) {
    //Remove . and ,
    //Remove img resolution eg (1080x960)
    //Replace BCE with BC
    //Replace CE with AD
    const sanatizedText = text
        .replace(/[.,]/g, "")
        .replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "")
        .replace(/(\bBCE\b)/gi, "BC")
        .replace(/(\bCE\b)/gi, "AD")

    const regexp = /(([0-9]+[stndrh]{2})+[– -](\bcentury\b)[ ABCD]*)|(([0-9]+)([– 0-9-])*([ABCD]{2})?)/ig

    console.log(sanatizedText);
    let results: string[] = [];

    for (const match of sanatizedText.matchAll(regexp) || [])
        results.push(match[0]);

    if (results.length <= 0) return [];

    console.log(results)
    return results;
}

function evaluateDates(dates: string[]) {
    const data = new WorkingData();

    //Remove trailing whitespaces and makes everything lowercase
    dates.map(d => d.trim().toLowerCase());

    data.dates = dates;

    //Reverse array to have BC, century etc words that are normally at the end
    //of the sentence at the front
    data.reversedDates = dates.reverse();
    data.WorkingDates = data.reversedDates;

    //Saves a boolean array to see where centuries need to be converted
    data.centuries = data.reversedDates.map(d => d.includes("cenutry"));

    //Stores each BC in a seperate array
    data.yearLabels = data.reversedDates.map(d => {
        if (d.includes("bc")) return "bc";
        if (d.includes("ad")) return "";
    });

    console.log(dates);
}

function convertCenturies(date: string) {
    const startsWithNumberRegex = /[0-9]+/g;
    let bc = "";
    if (date.includes("bc")) bc = "bc";
    const number = date.match(startsWithNumberRegex)[0];
    return number + "00" + bc;
}

function convertYearLabels(date: string) {
    if (date.includes("bc")) return "-" + date;
    return date;
}

//[ '(1100)', '1940' ]
//[ '4 ', '(1605)' ]
//[ '(1735-1796 AD)' ]
//[ '(5000-4000 BC)' ]
//[ '900', '11th century' ] -> picks 11th century only but reduces trust
//[ '37 BC', '31 AD' ] reverse: ['31 AD','37 BC'], centuries ['false','false'], lables: ['BC', 'AD']
//[ '37', '31 BC' ] reverse: ['31 BC','37'], centuries ['false','false'], lables: ['BC', '']
//[ '3', '400' ] reverse: ['4th century AD','3'], centuries ['true','false'], lables: ['ad', '']
//If first is cenutry, make second centruy (reduce trust)

//Takes format: [ '37 BC', '31 AD' ], [ '37', '31 BC' ], [ '3', '400' ]
//Converts both sides to BC or AD depending on first one if only one
//Finds differences of ADs and averages their range
function averageRanges(data: WorkingData) {
    let label: string;
    for (let i = 0; i < data.WorkingDates.length; i++) {
        if (data.yearLabels[i] != '') label = data.yearLabels[i];
        data.yearLabels[i] = label;
        let bc = '';
        if (data.yearLabels[i] === "bc") bc = "-";
        const number = data.WorkingDates[i].replace(/bc/ig, '').trim();
        data.WorkingDates[i] = bc + number;
    }

    //if any of the WorkingDates numbers start with -, ignore this step
    if (data.WorkingDates.findIndex(x => x.startsWith("-")) < 0) {
        const differences = getDifferences(data.WorkingDates);
        for (let i = 0; i < differences.length; i++) {
            if (differences[i] > AD_TIME_INTERVAL) {
                //Reduce trust the more is skipped/ignored
                continue;
            }
        }
    }

    //TODO: implement trust

    const numbers = data.WorkingDates.map(x => +x);
    const total = numbers.reduce((acc: number, x: number) => x + acc);
    return total / data.WorkingDates.length;
}

function difference(a: number, b: number) {
    return Math.abs(a - b);
}

function getDifferences(data: string[]): number[] {
    let result: number[] = []
    for (let i = 0; i < data.length; i++) {
        if ((i + 1) < data.length)
            result.push(difference(+data[i], +data[i + 1]));
    }
    return result;
}