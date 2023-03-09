import { Logger } from "./core/Utility/logging";
import { Server } from "socket.io";
import { startScraper } from "./core/index";
import express from "express";

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
	});
}

function start() {
	Logger.SetLoglevel();

	startServer();
}

start();
