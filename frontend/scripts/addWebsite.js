import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const inputs = document.getElementById("form").getElementsByTagName("input");
const submitButton = document.getElementById("submit");
const socket = io("http://localhost:3000");

submitButton.addEventListener("click", () => {
	console.log("Adding website");
	socket.emit("addWebsite", {
		website: {
			url: inputs.namedItem("websiteUrl").value,
			weight: inputs.namedItem("weight").value,
			nrOfPages: inputs.namedItem("nrOfPages").value,
		},
	});
});
