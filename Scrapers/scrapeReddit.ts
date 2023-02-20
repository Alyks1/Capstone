import { Website } from "../Types/Website";
import { Post } from "../Types/Post";
import { Page } from 'puppeteer';

export async function ScrapeReddit(website: Website, page: Page) {
    //First get the root
    const rootDivClass = '.rpBJOHq2PR60pnwJlUyP0';
    const root = (await page.$$(rootDivClass))[0];
    //Then get all the posts branching off of the root
    //Reddit shows 7 post at once
    const postElements = await root.$$('._1poyrkZ7g36PawDueRza-J');

    const posts: Post[] = [];
    for (let postElement of postElements) {
        const text = await postElement.$eval('._eYtD2XCVieq6emjKBH3m', t => t.textContent);
        let imgSrc = "";
        try {
            imgSrc = await postElement.$eval('.ImageBox-image', (i: HTMLImageElement) => i.src);
        } catch (e) {
            console.log("skipping..");
            continue;
        }

        posts.push({ text: text, imgSrc: imgSrc });
    }

    return posts;
}