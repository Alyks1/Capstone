import express from "express";
import * as http from "http";
import { Logger } from "./core/Utility/logging";
import { RoutesConfig } from "./routes";

function startServer() {
	Logger.trace("Starting Server");
	const app: express.Application = express();
	const server: http.Server = http.createServer(app);
	const port = 3000;
	const route: RoutesConfig = new RoutesConfig(app);

	app.get("/", (req: express.Request, res: express.Response) => {
		res.status(200).send(`Server running at http://localhost:${port}`);
	});

	server.listen(port, () => {
		Logger.trace("Server is listening");
	});
}

function start() {
	startServer();
}

start();
