import puppeteer from 'puppeteer';
import path from "path";
import fs from 'fs';
import { Website } from './Website';

async function start() {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    const websites = await LoadWebsites();
    for (let website of websites) {
        await page.goto(website.url)

        const textQuerySelector = website.textQuery;
        const imgQuerySelector = website.imgQuery;
        const text = await page.$eval(textQuerySelector, t => t.textContent);
        console.log(text);
        const imgSrc = await page.$eval(imgQuerySelector, (i: HTMLImageElement) => i.src);

        page.on('response', response => {
            if (response.headers()['content-type'] === 'image/webp') {
                console.log("img");
                response.buffer().then(file => {
                    const fileName = text + ".jpg";
                    const filePath = path.resolve('Images', fileName);
                    const writeStream = fs.createWriteStream(filePath);
                    writeStream.write(file);
                })
            }
        })

        await page.goto(imgSrc);

        await browser.close();
    }

}

async function LoadWebsites(): Promise<Website[]> {
    const data = await import("./websites.json")
    //Open up website file (Json)
    //parse Json to create object that can be passed to 
    //create dictionary of weight, website and 
    //Instantiate Query selectors
    return data.default.map(website => ({
        url: website.url,
        weight: website.weight,
        textQuery: website.textQuery,
        imgQuery: website.imgQuery,
    }))
}

start();