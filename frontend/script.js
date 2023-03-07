import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const startScraperButton = document.getElementById("start-button");
const socket = io("http://localhost:3000");
startScraperButton.addEventListener("click", () => {
	console.log("Starting Scraper");
	socket.emit("start");
});

socket.on("log", (msg) => {
	console.log(msg);
});
