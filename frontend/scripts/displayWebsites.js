import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

const list = document.getElementById("list");
const returnButton = document.getElementById("returnButton");
const socket = io(getSocketURL());

socket.emit("getWebsites");

socket.on("websites", (websites) => {
    console.log(`received websites`);
    createList(websites);
})

returnButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

function createList(websites) {
    websites.forEach((website, i) => {
        const url = cleanUrl(website.url);

        const li = document.createElement("li");

        const a = createA(url, i);
        const p = createP(website);
        const button = createDeactivateButton();

        li.appendChild(a);
        li.appendChild(p);
        li.appendChild(button);
        list.appendChild(li);
    });
}

function createDeactivateButton() {
    const button = document.createElement("button");
    button.textContent = "Deactivate";
    button.addEventListener("click", () => {
        socket.emit("deactivateWebsite", i);
        window.location.href = "displayWebsiteList.html";
    });
    return button
}

function createA(url, i) {
    const a = document.createElement("a");
    a.href = `updateWebsite.html?id=${i}`;
    a.textContent = url;
    return a;
}

function createP(website) {
    const p = document.createElement("p");
    p.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
    return p;
}