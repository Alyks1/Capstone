import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

//TODO: Add your own socket.io server url
//TODO: Add View all scraped data button (where was data scraped, how accurate, total accuracy?)?

const socket = io(getSocketURL());

const startScraperButton = document.getElementById("start-button");
const addWebsiteButton = document.getElementById("add-website");
const displayWebsiteButton = document.getElementById("display-websites");

const datasetDownloadDiv = document.getElementById("datasetDownloadDiv");
const datasetDownloadLink = document.getElementById("datasetDownloadLink");

const progressBarDiv = document.getElementById("progressDiv");
const progressBar = document.getElementById("progressBar");

if (sessionStorage.getItem("datasetUrl")) {
	showDownloadLink();
}

socket.on("log", (msg) => {
	console.log(msg);
	const progressText = document.getElementById("progressText");
	progressText.textContent = msg;
	progressBar.value++;
});

socket.on("sendDatasetUrl", (url) => {
	console.log(`Dataset url: ${url}`);
	sessionStorage.setItem("datasetUrl", url);
	progressBar.value++;
	if (progressBar.value === progressBar.max) {
		resetProgressBar()
	}
	showDownloadLink();
});

socket.on("NoPostsFound", () => {
    console.log("No posts found");
	resetProgressBar();
})

startScraperButton.addEventListener("click", () => {
	console.log("Starting Scraper");
	progressBarDiv.style.visibility = "visible";
	socket.emit("start");
});

addWebsiteButton.addEventListener("click", () => {
	window.location.href = "addWebsite.html";
});

displayWebsiteButton.addEventListener("click", () => {
	window.location.href = "displayWebsiteList.html";
});

function resetProgressBar() {
	progressBarDiv.style.visibility = "hidden";
	progressBar.value = 0;
}

function showDownloadLink() {
	datasetDownloadDiv.style.visibility = "visible";
	datasetDownloadLink.href = sessionStorage.getItem("datasetUrl");
}