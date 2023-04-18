import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

const list = document.getElementById("list");
const returnButton = document.getElementById("returnButton");
const nextButton = document.getElementById("nextButton");
const socket = io(getSocketURL());

nextButton.style.display = "none";
if (sessionStorage.getItem("wizard")) {
	returnButton.style.display = "none";
	nextButton.style.display = "inline-block";
}

socket.emit("getWebsites");
returnButton.style.display = "inline-block";

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
		li.style.borderBottom = "1px solid gray";
		if (websites.length === i + 1) li.style.borderBottom = "none";

		const a = createA(url, id);
		const p = createP(website);
		const button = createDeactivateButton(id, website.nrOfPages);
		const updateButton = createUpdateButton(id);

		li.appendChild(a);
		li.appendChild(p);
		li.appendChild(button);
		li.appendChild(updateButton);
		list.appendChild(li);
	});
}

function createDeactivateButton(i, nrOfPages) {
	const button = document.createElement("button");
	button.textContent = "Deactivate";
	button.addEventListener("click", () => {
		socket.emit("deactivateWebsite", i);
		button.style.display = "none";
		window.location.href = "displayWebsiteList.html";
	});
	if (nrOfPages === 0) button.style.display = "none";
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
	const p = document.createElement("p");
	p.style.fontWeight = "bold";
	p.textContent = url;
	return p;
}

function createP(website) {
	const p = document.createElement("p");
	p.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
	return p;
}
