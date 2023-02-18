const puppeteer = require('puppeteer');
const path = require("path");
const fs = require('fs');

async function start() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://www.reddit.com/r/ArtefactPorn/')

    const textQuerySelector = "#t3_114vnau > div._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3 > div._2FCtq-QzlfuN-SwVMUZMM3._3wiKjmhpIpoTE2r5KCm2o6.t3_114vnau > div.y8HYJ-y_lTUHkQIc1mdCq._2INHSNB8V5eaWp4P0rY_mE > a > div > h3";
    const imgQuerySelector = "#t3_114vnau > div._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3 > div.STit0dLageRsa2yR4te_b > div > div._3JgI-GOrkmyIeDeyzXdyUD._2CSlKHjH7lsjx0IpjORx14 > div > a > div > div > img";
    const text = await page.$eval(textQuerySelector, t => t.textContent);
    console.log(text);
    const imgSrc = await page.$eval(imgQuerySelector, i => i.src);
    await page.goto(imgSrc);
    await page.on('response', async resp => {
        console.log(resp);
        const url = resp.url();
        if (resp.request().resourceType() === 'image') {
            resp.buffer().then(file => {
                const fileName = url.split('/').pop();
                const filePath = path.resolve(__dirname, fileName);
                const writeStream = fs.createWriteStream(filePath);
                writeStream.write(file);
            })
        }
    })

    await sleep(2000);

    await browser.close();
}

async function LoadWebsites() {
    //Open up website file (Json)
    //parse Json to create object that can be passed to 
    //create dictionary of weight, website and 
    //Instantiate Query selectors
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

start();