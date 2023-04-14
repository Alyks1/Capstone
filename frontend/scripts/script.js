//TODO: Add your own socket.io server url
//TODO: Add more feedback to the user, like explaining how to use the dataset etc
//TODO: Clean UI
//TODO: Add Back button when in workflow, otherwise MainMenu

const startButton = document.getElementById("startButton");
const addWebsiteButton = document.getElementById("addWebsite");
const displayWebsiteButton = document.getElementById("displayWebsites");
const updateTrustCalcButton = document.getElementById("updateTrustCalc");
const displayDataButton = document.getElementById("displayData");

displayDataButton.disabled = true;

if (sessionStorage.getItem("datasetUrl")) {
	displayDataButton.disabled = false;
}

startButton.addEventListener("click", () => {
	console.log("Starting Scraper");
	sessionStorage.setItem("wizard", "true");
	window.location.href = "displayWebsiteList.html";
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
