import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const IMAGE_SIZE = 224;

const returnButton = document.getElementById("returnButton");
const updateDataButton = document.getElementById("updateDatasetButton");
const downloadButton = document.getElementById("datasetDownloadLink");
const list = document.getElementById("list");
const socket = io(getSocketURL());
const deactivatedData = sessionStorage.getItem("deactivatedData")
	? JSON.parse(sessionStorage.getItem("deactivatedData"))
	: [];

returnButton.style.display = "inline-block";
sessionStorage.removeItem("wizard");

if (sessionStorage.getItem("datasetUrl")) {
	downloadButton.href = sessionStorage.getItem("datasetUrl");
}

returnButton.addEventListener("click", () => {
	window.location.href = "index.html";
});

updateDataButton.addEventListener("click", () => {
	socket.emit("updateDataset", deactivatedData);
	sessionStorage.setItem("deactivatedData", JSON.stringify(deactivatedData));
	window.location.href = "displayData.html";
});

await getDataFromFile();

async function getDataFromFile() {
	const filePath = sessionStorage.getItem("datasetInfo") ?? "";
	//This contains the backup.csv bath ^
	const path = `../../../${filePath}`;
	const reader = new FileReader();
	await createFile(path, "datasetInfo.csv", "text/csv").then((file) => {
		reader.readAsText(file);
		reader.onload = function () {
			const rawData = reader.result;
			const rawDataArray = rawData.split("\n");
			const unfilteredData = rawDataArray.map((d) => {
				if (d === "") return;
				return parseCSV(d);
			});
			const data = unfilteredData.filter((d) => d !== undefined);
			createList(data);
		};
	});
}

function createList(data) {
	for (const d of data) {
		const li = document.createElement("li");
		li.className = "dataList";
		const text = `Year: ${d.year}, Trust: ${d.trust}`;
		const canvas = createCanvas(d.src);
		const p = createP(text);
		const deactivateButton = createDeactivateButton(d.id, li);
		const activateButton = createActivateButton(d.id, li);
		li.appendChild(p);
		li.appendChild(canvas);
		li.appendChild(deactivateButton);
		li.appendChild(activateButton);

		if (deactivatedData.indexOf(d.id) !== -1) {
			deactivateButton.style.display = "none";
			activateButton.style.display = "inline-block";
			li.style.opacity = 0.5;
		}

		list.appendChild(li);
	}
}

function createCanvas(src) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const img = new Image();
	img.src = src;
	canvas.width = IMAGE_SIZE;
	canvas.height = IMAGE_SIZE;
	img.onload = () => {
		ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
	};
	return canvas;
}

function createP(text) {
	const p = document.createElement("p");
	p.textContent = text;
	return p;
}

async function createFile(path, name, type) {
	const response = await fetch(path);
	const data = await response.blob();
	const metadata = {
		type: type,
	};
	return new File([data], name, metadata);
}

function createDeactivateButton(id, li) {
	const button = document.createElement("button");
	button.textContent = "Deactivate";
	button.id = `${id}Deactivate`;
	button.addEventListener("click", () => {
		deactivatedData.push(id);
		button.style.display = "none";
		document.getElementById(`${id}Activate`).style.display = "inline-block";
		li.style.opacity = 0.5;
	});
	return button;
}

function createActivateButton(id, li) {
	const button = document.createElement("button");
	button.textContent = "Activate";
	button.id = `${id}Activate`;
	button.style.display = "none";
	button.addEventListener("click", () => {
		const i = deactivatedData.indexOf(id);
		deactivatedData.splice(i, 1);
		button.style.display = "none";
		document.getElementById(`${id}Deactivate`).style.display = "inline-block";
		li.style.opacity = 1;
	});
	return button;
}

function parseCSV(csvData) {
	const data = csvData.split(",");
	const id = data[0];
	const year = data[1];
	const trust = data[2];
	const src = data[3];
	return { id, year, trust, src };
}
