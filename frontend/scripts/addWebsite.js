import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const form = document.getElementById("form");
const submitButton = document.getElementById("submit");
const returnButton = document.getElementById("returnButton");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const socket = io(getSocketURL());

nextButton.style.display = "none";
if (sessionStorage.getItem("wizard")) {
	returnButton.style.display = "none";
	backButton.style.display = "inline-block";
	nextButton.style.display = "inline-block";
}

submitButton.addEventListener("click", () => {
	console.log("Adding website");

	const inputs = form.elements;
	const url = inputs.namedItem("websiteUrl").value ?? "";
	const weight = inputs.namedItem("weight").value ?? "";
	const nrOfPages = inputs.namedItem("nrOfPages").value ?? "";

	if (!inputsOK(inputs)) return;
	socket.emit("addWebsite", {
		url: url,
		weight: Number(weight),
		nrOfPages: Number(nrOfPages),
	});
	window.location.href = "displayWebsiteList.html";
});

returnButton.addEventListener("click", () => {
	window.location.href = "index.html";
});

backButton.addEventListener("click", () => {
	window.location.href = "displayWebsiteList.html";
});

nextButton.addEventListener("click", () => {
	window.location.href = "adjustTrust.html";
});

function inputsOK(inputs) {
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].value === "") {
			alert("Please fill out all fields");
			return false;
		}
		if (inputs["weight"].value > 1 || inputs["weight"].value < 0) {
			alert("Min weight is 0 and max is 1");
			return false;
		}
		if (inputs["nrOfPages"].value > 10 || inputs["nrOfPages"].value < 0) {
			alert("min nr of pages is 0 and max is 10");
			return false;
		}
	}
	return true;
}
