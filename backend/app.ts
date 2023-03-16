import { Logger } from "./core/Utility/logging";
import { Server, Socket } from "socket.io";
import { startScraper } from "./core/index";
import express from "express";
import { addWebsite } from "./core/addWebsite";
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
			socket.emit("websites", await LoadWebsites());
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
	});
}

function start() {
	Logger.SetLoglevel();

	startServer();
}

start();
