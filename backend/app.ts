import { Logger } from "./core/Utility/logging";
import { Server, Socket } from "socket.io";
import { startScraper } from "./core/index";
import express from "express";
import { addWebsite, updateWebsite } from "./core/manageWebsite";
import { LoadWebsites } from "./core/Utility/json";
import { setTrustCalcOptions, getTrustCalcOptions, TrustCalcOptions } 
from "./core/GenerateData/trustCalculations";

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
			startScraper(socket);
		});
		socket.on("addWebsite", (website) => {
			const data = addWebsite(website);
			socket.emit("log", data);
		});
		socket.on("getWebsites", async () => {
			Logger.trace("Sending websites to client")
			const websites = await LoadWebsites();
			socket.emit("websites", websites);
		});
		socket.on("getSingularWebsite", async (id: number) => {
			Logger.trace(`Sending website with id ${id} to client`)
			const websites = await LoadWebsites();
			const website = websites.find((website) => website.id === id);
			if (website === undefined) {
				Logger.warn(`Website with id ${id} not found`);
			}
			socket.emit("singularWebsite", website);
		});
		socket.on("updateWebsite", async (website) => {
			Logger.trace(`Updating website with id ${website.id}`);
			await updateWebsite(website);
			socket.emit("log", "Website updated");
		});
		socket.on("deactivateWebsite", async (id: number) => {
			Logger.trace(`Deactivating website with id ${id}`);
			const websites = await LoadWebsites();
			const website = websites.find((website) => website.id === id);
			if (website === undefined) {
				Logger.warn(`Website with id ${id} not found`);
			}
			const newWebsite = {...website, nrOfPages: 0};
			await updateWebsite(newWebsite);
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
	});
}

function start() {
	Logger.SetLoglevel();

	startServer();
}

start();
