import { Logger } from "./core/Utility/logging";
import { Server } from "socket.io";
import { startScraper } from "./core/index";
import express from "express";
import { setTrustCalcOptions, getTrustCalcOptions, TrustCalcOptions } 
from "./core/GenerateData/trustCalculations";
import { addWebsite, deactivateWebsite, getWebsite, 
	getWebsites, updateWebsite } from "./core/Database/dbWebsite";

function startServer() {
	Logger.trace("Starting Server");
	const app = express();
	const port = 3000;
	const http = require("http");
	const server = http.createServer(app);
	const io = new Server(server);

	app.use(express.static("../frontend/"));

	server.listen(port, () => {
		console.log(`listening on http://localhost:${port}`);
	});

	io.on("connection", (socket) => {
		socket.on("start", () => {
			Logger.info("Starting scraper");
			startScraper(socket);
		});
		socket.on("addWebsite", async (website) => {
			Logger.trace(`Adding website ${website.url}`);
			const data = await addWebsite(website)
			socket.emit("log", data);
		});
		socket.on("getWebsites", async () => {
			Logger.trace("Sending websites to client")
			const websites = await getWebsites();
			socket.emit("websites", websites);
		});
		socket.on("getSingularWebsite", async (id: number) => {
			Logger.trace(`Sending website with id ${id} to client`)
			const website = await getWebsite(id);
			socket.emit("singularWebsite", website);
		});
		socket.on("updateWebsite", async (website) => {
			Logger.trace(`Updating website with id ${website.id}`);
			await updateWebsite(website);
			socket.emit("log", "Website updated");
		});
		socket.on("deactivateWebsite", async (id: number) => {
			Logger.trace(`Deactivating website with id ${id}`);
			await deactivateWebsite(id);
			socket.emit("log", "Website deactivated");
		});
		socket.on("getTrustCalc", async () => {
			Logger.info("Sending trustCalc to client");
			const data = await getTrustCalcOptions();
			socket.emit("trustCalc", data);
		});
		socket.on("setTrustCalc", async (activations: TrustCalcOptions) => {
			Logger.info(JSON.stringify(activations));
			await setTrustCalcOptions(activations);
			socket.emit("log", "Updated trustCalc");
		});
		socket.on("updateDataset", async (ids: number[]) => {
			
		});
	});
}

function start() {
	Logger.SetLoglevel();

	startServer();
}

start();
