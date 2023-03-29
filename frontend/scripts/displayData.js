import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { getSocketURL } from "./utility.js";

const returnButton = document.getElementById("returnButton");
const updateDataButton = document.getElementById("updateDatasetButton");
const list = document.getElementById("list");
const socket = io(getSocketURL());
var deactivatedData = [];


returnButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

updateDataButton.addEventListener("click", () => {
    socket.emit("updateDataset", deactivatedData);
    deactivatedData = [];
    window.location.href = "displayData.html";
});

await getDataFromFile();

async function getDataFromFile() {
    const filePath = sessionStorage.getItem("datasetInfo") ?? "";
    const path = `../../../${filePath}`;
    const reader = new FileReader();
    await createFile(path, "datasetInfo.csv", 'text/csv')
    .then((file) => {
        reader.readAsText(file);
        reader.onload = function () {
            const rawData = reader.result;
            const rawDataArray = rawData.split("\n");
            const unfilteredData = rawDataArray.map((d) => {
                if (d === "") return;
                return parseCSV(d)
            });
            const data = unfilteredData.filter((d) => d !== undefined);
            createList(data);
        }
     });
}

function createList(data) {
    for (const d of data) {
        const li = document.createElement("li");
        li.className = "dataList";
        const text = `Year: ${d.year}, Trust: ${d.trust}`;
        const img = createImg(d.src);
        const p = createP(text);
        const deleteButton = createDeleteButton(d.id, li);
        const activateButton = createActivateButton(d.id, li);
        li.appendChild(p);
        li.appendChild(img);
        li.appendChild(deleteButton);
        li.appendChild(activateButton);
        list.appendChild(li);
    }
}

function createImg(src) {
    const img = document.createElement("img");
    img.src = src;
    return img;
}

function createP(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
}

async function createFile(path, name, type) {
    let response = await fetch(path);
    let data = await response.blob();
    let metadata = {
        type: type
    };
    return new File([data], name, metadata);
}

function createDeleteButton(id, li) {
    const button = document.createElement("button");
    button.textContent = "Delete";
    button.id = `${id}Delete`;
    button.addEventListener("click", () => {
        deactivatedData.push(id);
        button.style.visibility = "hidden";
        document.getElementById(`${id}Activate`).style.visibility = "visible";
        li.style.opacity = 0.5;
    });
    return button;
}

function createActivateButton(id, li) {
    const button = document.createElement("button");
    button.textContent = "Activate";
    button.id = `${id}Activate`;
    button.style.visibility = "hidden";
    button.addEventListener("click", () => {
        const i = deactivatedData.indexOf(id);
        deactivatedData.splice(i, 1);
        button.style.visibility = "hidden";
        document.getElementById(`${id}Delete`).style.visibility = "visible";
        li.style.opacity = 1;
    });
    return button;
}

function parseCSV(csvData) {
    const data = csvData.split(",");
    const id = data[0];
    const year = data[1];
    const trust = data[2];
    const src = data[3];
    return {id, year, trust, src}
}