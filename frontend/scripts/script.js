import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

//TODO: Add your own socket.io server url
//TODO: Add 'Remove website from scraper' button
//TODO: Add Update NrOfPages of website button
//TODO: Add View all websites to scrape button
//TODO: Add View all scraped data button (where was data scraped, how accurate, total accuracy?)?

const startScraperButton = document.getElementById("start-button");
const datasetDownloadDiv = document.getElementById("datasetDownloadDiv");
const datasetDownloadLink = document.getElementById("datasetDownloadLink");
const progressBarDiv = document.getElementById("progressDiv");
const progressBar = document.getElementById("progressBar");
const addWebsiteButton = document.getElementById("add-website");
const displayWebsiteButton = document.getElementById("display-websites");

const socket = io(getSocketURL());

socket.on("log", (msg) => {
	console.log(msg);
	const progressText = document.getElementById("progressText");
	progressText.textContent = msg;
	progressBar.value++;
});

socket.on("sendDatasetUrl", (url) => {
	console.log(`Dataset url: ${url}`);
	progressBar.value++;
	if (progressBar.value === progressBar.max) {
		datasetDownloadDiv.style.visibility = "visible";
		datasetDownloadLink.href = url;
		progressBarDiv.style.visibility = "hidden";
	}
});

startScraperButton.addEventListener("click", () => {
	progressBarDiv.style.visibility = "visible";
	progressBar.value = 0;
	console.log("Starting Scraper");
	socket.emit("start");
});

addWebsiteButton.addEventListener("click", () => {
	window.location.href = "addWebsite.html";
});

displayWebsiteButton.addEventListener("click", () => {
	window.location.href = "displayWebsiteList.html";
});

socket.on("NoPostsFound", () => {
    console.log("No posts found");
	progressBarDiv.style.visibility = "hidden";
	progressBar.value = 0;
})