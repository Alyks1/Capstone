import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const form = document.getElementById("form");
const submitButton = document.getElementById("submitButton");
const returnButton = document.getElementById("returnButton");
const nextButton = document.getElementById("nextButton");
const socket = io(getSocketURL());

socket.emit("getTrustCalc");

socket.on("trustCalc", (json) => {
	const trustCalc = JSON.parse(json);
	console.log(trustCalc);
	//-2 because the last input is reduceTrust which is not a checkbox
	for (let i = 0; i < form.elements.length - 2; i++) {
		const input = form.elements[i];
		console.log(input.name);
		input.checked = parseToBool(trustCalc[input.name]);
	}
	form.elements.namedItem("reduceTrust").value = Number(trustCalc.reduceTrust);
});

returnButton.addEventListener("click", () => {
	window.location.href = "index.html";
});

nextButton.addEventListener("click", () => {
	window.location.href = "loadingScreen.html";
});

submitButton.addEventListener("click", () => {
	console.log("Saving changes to trust calculation parameters");
	socket.emit("setTrustCalc", {
		notBetween0and100: getChecked("notBetween0and100", form.elements),
		differentNr: getChecked("differentNr", form.elements),
		multipleOf10and5: getChecked("multipleOf10and5", form.elements),
		between0and10: getChecked("between0and10", form.elements),
		reduceTrust: form.elements.namedItem("reduceTrust").value,
	});
});

function parseToBool(checked) {
	if (checked === "true") return true;
	else if (checked === "false") return false;
	else throw new Error(`Invalid value for boolean: ${checked}`);
}

function getChecked(name, inputs) {
	return inputs.namedItem(name).checked.toString();
}
