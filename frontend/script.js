import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

//TODO: Add your own socket.io server url
//TODO: Add 'Add new website to scraper' button
//TODO: Add 'Remove website from scraper' button
//TODO: Add Update NrOfPages of website button
//TODO: Add View all websites to scrape button
//TODO: Add View all scraped data button (where was data scraped, how accurate, total accuracy?)?

const startScraperButton = document.getElementById("start-button");
const DatasetDownloadLink = document.getElementById("datasetDownload");
const socket = io("http://localhost:3000");
startScraperButton.addEventListener("click", () => {
	console.log("Starting Scraper");
	socket.emit("start");
});

socket.on("log", (msg) => {
	console.log(msg);
});

socket.on("sendDatasetUrl", (url) => {
	console.log(`Dataset url: ${url}`);
	DatasetDownloadLink.style.visibility = "visible";
});
