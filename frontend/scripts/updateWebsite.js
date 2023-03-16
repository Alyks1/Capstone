import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

//Then new nrOfPages can be entered and the website will be updated
const socket = io(getSocketURL());
const header = document.getElementById("website");
const websiteInfo = document.getElementById("websiteInfo");
const updateButton = document.getElementById("updateButton");

socket.emit("getSingularWebsite", getID());

socket.on("singularWebsite", (website) => {
    console.log(website);
    const url = cleanUrl(website.url);
    header.textContent = url;
    websiteInfo.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
    document.getElementById("nrOfPages").value = website.nrOfPages;
    document.getElementById("weight").value = website.weight;
})

updateButton.addEventListener("click", () => {
    const id = getID();
    const newNrOfPages = document.getElementById("nrOfPages").value
    const weight = document.getElementById("weight").value
    socket.emit("updateWebsite", {
        id: id,
        nrOfPages: Number(newNrOfPages),
        weight: Number(weight)
    });
    window.location.href = "displayWebsiteList.html";
});

function getID() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log(id);  
    return Number(id);
}