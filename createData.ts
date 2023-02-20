import { Page } from "puppeteer";
import { Post } from "./Types/Post";

export async function CreateDataSetFromPost(posts: Post[], page: Page) {
    //Goto each imageSrc and screenshot/pdf it
    //Use text as name
    //There must be a better way to do this but here we are
    for (let post of posts) {
        //TODO: Fix this
        const filename = extractDates(post.text);
        //Use fetch to download img
        await page.goto(post.imgSrc);
        await page.pdf({ path: `./Images/${filename}.pdf` })
    };
}

function extractDates(text: string) {
    //Remove all , and . before this.
    const sanatizedText = text.replace(/[.,]/g, "");

    //This matches year numbers like 1532 and 24-56AD
    const yearRegexp = /(?<![[(])[0-9]+(BCE|AD|BC|CE)?(-[0-9]+)?( )?(BCE|AD|BC|CE)?(S| |-)(?!X|×)/ig;
    //This matches time frames like 7th century BC
    const rangeRegexp = /[0-9]+(ST|ND|RD|TH)( )*[A-Z]*( )?[0-9]*(ST|ND|RD|TH)*( )?(\bcentury\b)+( )?(BCE|AD|BC|CE)?/ig;

    console.log(sanatizedText);
    let results = [];

    if (sanatizedText.matchAll(yearRegexp)) {
        results = [...sanatizedText.matchAll(yearRegexp)]
    }
    else if (sanatizedText.matchAll(rangeRegexp)) {
        results = [...sanatizedText.matchAll(rangeRegexp)]
    }

    // if (yearRegexp.test(sanatizedText)) {
    //     results = yearRegexp.exec(sanatizedText);
    // } else if (rangeRegexp.test(sanatizedText)) {
    //     results = rangeRegexp.exec(sanatizedText);
    // }

    console.log(results)
    return results[0][0];
}