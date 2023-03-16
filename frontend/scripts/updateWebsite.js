import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

//Then new nrOfPages can be entered and the website will be updated
const socket = io(getSocketURL());
const header = document.getElementById("website");
const websiteInfo = document.getElementById("websiteInfo");
const updateButton = document.getElementById("updateButton");
const form = document.getElementById("updateForm");

document.onload = socket.emit("getSingularWebsite", getID());

socket.on("singularWebsite", (website) => {
    console.log(website);
    const url = cleanUrl(website.url);
    header.textContent = url;
    websiteInfo.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
    form.elements.nrOfPages.value = website.nrOfPages;
    form.elements.weight.value = website.weight;
})

updateButton.addEventListener("click", () => {
    const id = getID();
    const newNrOfPages = form.elements.nrOfPages.value;
    const weight = form.elements.weight.value;
    socket.emit("updateWebsite", {
        id: id,
        nrOfPages: newNrOfPages,
        weight: weight
    });
});

function getID() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log(id);  
    return Number(id);
}