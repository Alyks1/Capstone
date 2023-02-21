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
    //Remove . and ,
    //Remove img resolution eg (1080x960)
    //Replace BCE with BC
    //Replace CE with AD
    const sanatizedText = text
        .replace(/[.,]/g, "")
        .replace(/([\(\[])([0-9])*([x× ])*[0-9]*([\)\]])/g, "")
        .replace(/(\bBCE\b)/gi, "BC")
        .replace(/(\bCE\b)/gi, "AD")

    const regexp = /(([0-9]+[stndrh]{2}) +(\bcentury\b)[ ABCD]*)|(([0-9]+)([– 0-9-])*([ABCD]{2})?)/ig

    console.log(sanatizedText);
    let results = [];

    if (sanatizedText.matchAll(regexp)) {
        console.log("matching");
        results = [...sanatizedText.matchAll(regexp)];
    }

    if (results.length <= 0) return sanatizedText;

    console.log(results)
    return results[0][0];
}