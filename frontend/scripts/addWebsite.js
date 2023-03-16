import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const inputs = document.getElementById("form").getElementsByTagName("input");
const submitButton = document.getElementById("submit");
const socket = io(getSocketURL());

submitButton.addEventListener("click", () => {
	console.log("Adding website");
	socket.emit("addWebsite", {
		website: {
			url: inputs.namedItem("websiteUrl").value,
			weight: Number(inputs.namedItem("weight").value),
			nrOfPages: Number(inputs.namedItem("nrOfPages").value),
		},
	});
});

socket.on("log", (msg) => {
	console.log(msg);
});
