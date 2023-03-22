import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

//Then new nrOfPages can be entered and the website will be updated
const socket = io(getSocketURL());
const header = document.getElementById("website");
const websiteInfo = document.getElementById("websiteInfo");
const updateButton = document.getElementById("updateButton");
const backButton = document.getElementById("backButton");

const MaxNrOfPages = 10;
const MaxWeight = 1;

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

    if (!updateIsOK(newNrOfPages, weight)) return

    socket.emit("updateWebsite", {
        id: id,
        nrOfPages: Number(newNrOfPages),
        weight: Number(weight)
    });
    window.location.href = "displayWebsiteList.html";
});

backButton.addEventListener("click", () => {
    window.location.href = "displayWebsiteList.html";
});

function getID() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log(id);  
    return Number(id);
}

function updateIsOK(nrOfPages, weight) {
    if (nrOfPages > MaxNrOfPages) {
        alert(`Max nr of pages is ${MaxNrOfPages}`);
        return false;
    }
    if (weight > MaxWeight) {
        alert(`Max weight is ${MaxWeight}`);
        return false;
    }
    if (nrOfPages < 0 || weight < 0) {
        alert("Minimum is 0");
        return false; 
    }
    return true
}