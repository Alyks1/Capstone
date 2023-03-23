import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

//TODO: Add your own socket.io server url
//TODO: Add option to select and deselect data

const socket = io(getSocketURL());

const startScraperButton = document.getElementById("start-button");
const addWebsiteButton = document.getElementById("addWebsite");
const displayWebsiteButton = document.getElementById("displayWebsites");
const updateTrustCalcButton = document.getElementById("updateTrustCalc");
const displayDataButton = document.getElementById("displayData"); 

const datasetDownloadDiv = document.getElementById("datasetDownloadDiv");
const datasetDownloadLink = document.getElementById("datasetDownloadLink");

const progressBarDiv = document.getElementById("progressDiv");
const progressBar = document.getElementById("progressBar");

displayDataButton.disabled = true;

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

socket.on("sendDatasetInfo", (url) => {
	sessionStorage.setItem("datasetInfo", url);
});

socket.on("NoPostsFound", () => {
    console.log("No posts found");
	resetProgressBar();
})

startScraperButton.addEventListener("click", () => {
	console.log("Starting Scraper");
	progressBarDiv.style.visibility = "visible";
	startScraperButton.disabled = true;
	addWebsiteButton.disabled = true;
	displayWebsiteButton.disabled = true;
	updateTrustCalcButton.disabled = true;
	displayDataButton.disabled = true;
	socket.emit("start");
});

addWebsiteButton.addEventListener("click", () => {
	window.location.href = "addWebsite.html";
});

displayWebsiteButton.addEventListener("click", () => {
	window.location.href = "displayWebsiteList.html";
});

updateTrustCalcButton.addEventListener("click", () => {
	window.location.href = "adjustTrust.html";
});

displayDataButton.addEventListener("click", () => {
	window.location.href = "displayData.html";
});

function resetProgressBar() {
	progressBarDiv.style.visibility = "hidden";
	progressBar.value = 0;
}

function showDownloadLink() {
	datasetDownloadDiv.style.visibility = "visible";
	datasetDownloadLink.href = sessionStorage.getItem("datasetUrl");
	displayDataButton.disabled = false;
	startScraperButton.disabled = false;
	addWebsiteButton.disabled = false;
	displayWebsiteButton.disabled = false;
	updateTrustCalcButton.disabled = false;
}