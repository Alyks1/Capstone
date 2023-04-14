import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

const list = document.getElementById("list");
const returnButton = document.getElementById("returnButton");
const nextButton = document.getElementById("nextButton");
const socket = io(getSocketURL());

socket.emit("getWebsites");
returnButton.style.visibility = "visible";

socket.on("websites", (websites) => {
	console.log("received websites");
	createList(websites);
});

returnButton.addEventListener("click", () => {
	window.location.href = "index.html";
});

nextButton.addEventListener("click", () => {
	window.location.href = "addWebsite.html";
});

function createList(websites) {
	websites.forEach((website, i) => {
		const id = i + 1;
		const url = cleanUrl(website.url);

		const li = document.createElement("li");

		const a = createA(url, id);
		const p = createP(website);
		const button = createDeactivateButton(id);
		const updateButton = createUpdateButton(id);

		li.appendChild(a);
		li.appendChild(p);
		li.appendChild(button);
		li.appendChild(updateButton);
		list.appendChild(li);
	});
}

function createDeactivateButton(i) {
	const button = document.createElement("button");
	button.textContent = "Deactivate";
	button.addEventListener("click", () => {
		socket.emit("deactivateWebsite", i);
		window.location.href = "displayWebsiteList.html";
	});
	return button;
}

function createUpdateButton(i) {
	const button = document.createElement("button");
	button.textContent = "Update";
	button.addEventListener("click", () => {
		window.location.href = `updateWebsite.html?id=${i}`;
	});
	return button;
}

function createA(url, i) {
	const a = document.createElement("a");
	a.href = `updateWebsite.html?id=${i}`;
	a.textContent = url;
	return a;
}

function createP(website) {
	const p = document.createElement("p");
	p.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
	return p;
}
