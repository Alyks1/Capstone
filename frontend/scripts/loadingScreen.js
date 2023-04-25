import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const socket = io(getSocketURL());
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

socket.emit("start");

socket.on("log", (msg) => {
	console.log(msg);
	progressText.textContent = msg;
	progressBar.value++;
});

socket.on("error", (msg) => {
	console.log(msg);
	window.location.href = "index.html";
});

socket.on("sendDatasetInfo", (urls) => {
	console.log(`Dataset url: ${urls}`);
	progressBar.value++;
	const arr = urls.split(",");
	const dataset = arr[0];
	const datasetBackup = arr[1];
	sessionStorage.setItem("datasetInfo", datasetBackup);
	sessionStorage.setItem("datasetUrl", dataset);
	window.location.href = "displayData.html";
});
