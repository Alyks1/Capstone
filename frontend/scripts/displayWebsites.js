import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

const list = document.getElementById("list");
const returnButton = document.getElementById("returnButton");
const socket = io(getSocketURL());

socket.emit("getWebsites");

socket.on("websites", (websites) => {
    console.log(`received websites`);
    websites.forEach((website, i) => {
        console.log(JSON.stringify(website));
        const url = cleanUrl(website.url);
        const li = document.createElement("li");
        const a = document.createElement("a");
        const button = document.createElement("button");
        button.textContent = "Deactivate";
        button.addEventListener("click", () => {
            socket.emit("deactivateWebsite", i);
            window.location.href = "displayWebsiteList.html";
        });
        a.href = `updateWebsite.html?id=${i}`;
        a.textContent = url;
        li.appendChild(a);
        const p = document.createElement("p");
        p.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
        li.appendChild(p);
        li.appendChild(button);
        list.appendChild(li);
    });
})

returnButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

