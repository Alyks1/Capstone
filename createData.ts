import { Page } from "puppeteer";
import { Post } from "./Types/Post";
import { WorkingData } from "./Types/WorkingData";

//Within 100 years difference allow a range to be calculated
const AD_TIME_INTERVAL = 276; //Qing Dynasty

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

    const regexp = /(([0-9]+[stndrh]{2})+[– -](\bcentury\b)[ ABCD]*)|(([0-9]+)([ 0-9])*([ABCD]{2})?)/ig

    console.log(sanatizedText);
    let results: string[] = [];

    for (const match of sanatizedText.matchAll(regexp) || [])
        results.push(match[0]);

    if (results.length <= 0) return [];

    return results;
}

function evaluateDates(dates: string[]) {
    let data = new WorkingData();

    //Remove trailing whitespaces and makes everything lowercase
    dates = dates.map(d => d.trim().toLowerCase());
    data.dates = dates;

    //Reverse array to have BC, century etc words that are normally at the end
    //of the sentence at the front
    const reversedDates = dates.reverse();
    data.WorkingDates = reversedDates;
    console.log(data.WorkingDates);
    //Saves a boolean array to see where centuries need to be converted
    data.centuries = reversedDates.map(d => d.includes("century"));

    //Stores each BC in a seperate array
    data.yearLabels = reversedDates.map(d => {
        if (d.includes("bc")) return "bc";
        if (d.includes("ad")) return "";
    });

    data.WorkingDates = convertCenturies(data);

    const r = averageRanges(data)
    console.log(r);
    return r;
}

//TODO: Refactor this
//Only translates centuries into numbers
//Fix this issue ([ '3', '4th century' ] only being [ '3', '400' ]) by checking a variance of up to 2 centuries
function convertCenturies(data: WorkingData) {
    const temp: string[] = []
    for (let i = 0; i < data.WorkingDates.length; i++) {
        if (data.centuries[i] === true) {
            const startsWithNumberRegex = /[0-9]+/g;
            let bc = "";
            if (data.WorkingDates[i].includes("bc")) bc = "bc";
            const number = data.WorkingDates[i].match(startsWithNumberRegex)[0];
            temp[i] = number;
            data.WorkingDates[i] = number + "00" + bc;
        } else {
            temp.forEach(x => {
                if (Math.abs(+x - +data.WorkingDates[i]) < 3) {
                    const startsWithNumberRegex = /[0-9]+/g;
                    let bc = "";
                    if (data.WorkingDates[i].includes("bc")) bc = "bc";
                    const number = data.WorkingDates[i].match(startsWithNumberRegex)[0];
                    temp[i] = number;
                    data.WorkingDates[i] = number + "00" + bc;
                }
            });
        }
    }
    return data.WorkingDates;
}

//Takes format: [ '37 BC', '31 AD' ], [ '37', '31 BC' ], [ '3', '400' ]
//Converts both sides to BC or AD depending on first one if only one
//Finds differences of ADs and averages their range console
function averageRanges(data: WorkingData) {
    let label: string;
    for (let i = 0; i < data.WorkingDates.length; i++) {
        if (data.yearLabels[i] != '') label = data.yearLabels[i];
        data.yearLabels[i] = label;
        let bc = '';
        if (data.yearLabels[i] == "bc") bc = "-";
        const number = data.WorkingDates[i].replace(/(bc|ad)/ig, '').trim();
        data.WorkingDates[i] = bc + number;
    }

    //if any of the WorkingDates numbers start with -, ignore this step
    if (data.WorkingDates.findIndex(x => x.startsWith("-")) < 0) {
        const newData: string[] = [];
        const differences = getDifferences(data.WorkingDates);

        for (let i = 0; i < differences.length; i++) {
            //Reduce trust for each skip
            if (differences[i] > AD_TIME_INTERVAL) continue;
            newData[i] = data.WorkingDates[i];
            newData[i + 1] = data.WorkingDates[i + 1]
        }
        //What if nothing works ie [1940,1100]
        if (newData.length == 0) {
            const numbers = data.WorkingDates.map(x => +x);
            newData[0] = Math.min(...numbers).toString();
            //Reduce Trust
        }
        data.WorkingDates = newData;
    }

    //TODO: implement trust
    const numbers = data.WorkingDates.map(x => +x);
    const total = numbers.reduce((acc: number, x: number) => x + acc, 0);
    return Math.round(total / data.WorkingDates.length).toString();
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