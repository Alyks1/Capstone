import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { cleanUrl, getSocketURL } from "./utility.js";

//Display a list of all websites
//When a website is clicked, redirect to updateWebsite.html
//Add a button to add a new website
//Add a button to remove a website
//Add a button to update nrOfPages of a website
const list = document.getElementById("list");
const socket = io(getSocketURL());

socket.emit("getWebsites");

socket.on("websites", (websites) => {
    console.log(`received websites`);
    websites.forEach((website, i) => {
        console.log(JSON.stringify(website));
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
    });
})