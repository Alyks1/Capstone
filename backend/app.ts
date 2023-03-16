import { Logger } from "./core/Utility/logging";
import { Server, Socket } from "socket.io";
import { startScraper } from "./core/index";
import express from "express";
import { addWebsite, updateWebsite } from "./core/manageWebsite";
import { LoadWebsites } from "./core/Utility/json";

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
			const resp = addWebsite(website);
			socket.emit("log", resp);
		});
		socket.on("getWebsites", async () => {
			Logger.trace("Sending websites to client")
			const websites = await LoadWebsites();
			Logger.debug(websites.map((website) => website.url).join(", "));
			socket.emit("websites", websites);
		})
		socket.on("getSingularWebsite", async (id:number) => {
			Logger.trace(`Sending website with id ${id} to client`)
			const websites = await LoadWebsites();
			const website = websites.find((website) => website.id === id);
			if (website === undefined) {
				Logger.warn(`Website with id ${id} not found`);
			}
			socket.emit("singularWebsite", website);
		})
		socket.on("updateWebsite", async (website) => {
			Logger.trace(`Updating website with id ${website.id}`);
			await updateWebsite(website);
			socket.emit("log", "Website updated");
			})
	});
}

function start() {
	Logger.SetLoglevel();

	startServer();
}

start();
