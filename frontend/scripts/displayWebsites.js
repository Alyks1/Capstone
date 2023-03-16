import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

//Display a list of all websites
//When a website is clicked, redirect to updateWebsite.html
//Add a button to add a new website
//Add a button to remove a website
//Add a button to update nrOfPages of a website
const list = document.getElementById("list");
const socket = io("http://localhost:3000");

document.onload = socket.emit("getWebsites");

socket.on("websites", (websites) => {
    websites.forEach((website, i) => {
        const url = cleanUrl(website.url);
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `updateWebsite.html?id=${i}`;
        a.textContent = url;
        li.appendChild(a);
        const p = document.createElement("p");
        p.textContent = `NrOfPages: ${website.nrOfPages} - Weight: ${website.weight}`;
        li.appendChild(p);
        list.appendChild(li);
        localStorage.setItem(i, JSON.stringify(website));
    });
})

function cleanUrl(url) {
    return url.replace("https://", "").replace("http://", "").replace("www.", "");
}