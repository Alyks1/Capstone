import puppeteer from 'puppeteer';
import { Website } from './Types/Website';
import { ScrapeReddit } from './Scrapers/scrapeReddit'

async function start() {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    const websites = await LoadWebsites();
    for (let website of websites) {
        await page.goto(website.url)

        //Reddit shows 7 posts
        switch (website.group) {
            case "Reddit": {
                await ScrapeReddit(website, page);
                break;
            }
        }

    }
    await browser.close();
}

async function LoadWebsites(): Promise<Website[]> {
    const data = await import("./websites.json")
    //Open up website file (Json)
    //parse Json to create object that can be passed to 
    //create dictionary of weight, website and 
    //Instantiate Query selectors
    return data.default.map(website => ({
        url: website.url,
        group: website.group,
        weight: website.weight,
        nrOfData: website.nrOfData,
    }))
}

start();