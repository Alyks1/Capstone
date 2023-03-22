
const returnButton = document.getElementById("returnButton");
const list = document.getElementById("list");

returnButton.addEventListener("click", () => {
    window.location.href = "index.html";
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
    console.log(data);
    for (const d of data) {
        const li = document.createElement("li");
        li.className = "dataList";
        const text = `Year: ${d.year}, Trust: ${d.trust}`;
        const img = createImg(d.src);
        const p = createP(text);
        li.appendChild(p);
        li.appendChild(img);
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

function parseCSV(csvData) {
    const data = csvData.split(",");
    const id = data[0];
    const year = data[1];
    const trust = data[2];
    const src = data[3];
    console.log(id, year, trust, src)
    return {id, year, trust, src}
}