import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const form = document.getElementById("form");
const submitButton = document.getElementById("submitButton");
const returnButton = document.getElementById("returnButton");
const socket = io(getSocketURL());

socket.emit("getTrustCalc");

socket.on("trustCalc", (json) => {
    const trustCalc = JSON.parse(json);
    console.log(trustCalc);
    const inputs = form.elements;
    console.log(parseToBool(trustCalc.notBetween0and100))
    inputs.namedItem("notBetween0and100").checked = parseToBool(trustCalc.notBetween0and100);
    inputs.namedItem("differentNr").checked = parseToBool(trustCalc.differentNr);
    inputs.namedItem("multipleOf10and5").checked = parseToBool(trustCalc.multipleOf10and5);
    inputs.namedItem("between0and10").checked = parseToBool(trustCalc.between0and10);

    inputs.namedItem("reduceTrust").value = Number(trustCalc.reduceTrust);
});

returnButton.addEventListener("click", () => {
	window.location.href = "index.html";
});

submitButton.addEventListener("click", () => {
    console.log("Saving changes to trust calculation parameters");

	const inputs = form.elements;
	const notBetween0and100 = inputs.namedItem("notBetween0and100").checked.toString();
	const differentNr = inputs.namedItem("differentNr").checked.toString();
	const multipleOf10and5 = inputs.namedItem("multipleOf10and5").checked.toString();
    const between0and10 = inputs.namedItem("between0and10").checked.toString();
    const reduceTrust = inputs.namedItem("reduceTrust").value;

	socket.emit("setTrustCalc",
		{
			notBetween0and100: notBetween0and100,
            differentNr: differentNr,
            multipleOf10and5: multipleOf10and5,
            between0and10: between0and10,
            reduceTrust: reduceTrust
		}
	);
});

function parseToBool(checked) {
    if (checked === "true") return true;
    return false;
}
