import { Page } from "puppeteer";
import { Post } from "./Types/Post";

export async function CreateDataSetFromPost(posts: Post[], page: Page) {
    //Goto each imageSrc and screenshot/pdf it
    //Use text as name
    //There must be a better way to do this but here we are
    for (let post of posts) {
        //TODO: Fix this
        const filename = createFilename(post.text);
        await page.goto(post.imgSrc);
        await page.pdf({ path: `./Images/${filename}.pdf` })
    };
}

function createFilename(text: string) {
    //Maybe remove all , and . before this.
    const sanatizedText = text.replace(",", "").replace(".", "");
    var regexp = new RegExp('((?<!\\\[|\\\()[0-9]+(BCE|AD|BC|CE)?(-[0-9]+)?( )?(BCE|AD|BC|CE)?(S| )(?!X|×))|([0-9]+(ND|ST|RD|TH)( )*[A-Z]*( )(BCE|AD|BC|CE)?)', 'i');

    //This matches year numbers like 1532 and 24-56AD (?<!\[|\()[0-9]+(BCE|AD|BC|CE)?(-[0-9]+)?( )?(BCE|AD|BC|CE)?(S| )(?!X|×)
    //This matches time frames like 7th century BC [0-9]+(ND|ST|RD|TH)( )*[A-Z]*( )?(BCE|AD|BC|CE)? TODO: Fix this regex to allow "4th century bc until 5th century AD"
    const results = regexp.exec(sanatizedText);
    results.map(x => console.log(x));

    return results[0];
}