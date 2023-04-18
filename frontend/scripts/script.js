const startButton = document.getElementById("startButton");
const addWebsiteButton = document.getElementById("addWebsite");
const displayWebsiteButton = document.getElementById("displayWebsites");
const updateTrustCalcButton = document.getElementById("updateTrustCalc");
const displayDataButton = document.getElementById("displayData");

displayDataButton.disabled = true;
sessionStorage.removeItem("wizard");

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
