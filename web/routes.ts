import express from "express";
import { start } from "..";
export class RoutesConfig {
	app: express.Application;

	constructor(app: express.Application) {
		this.app = app;
		this.configureRoutes();
	}

	configureRoutes() {
		this.app
			.route("/start")
			.get((_: express.Request, res: express.Response) => {
				res.status(200).send("Starting Scraper");
				start();
			});

		this.app
			.route("/website")
			.get((_: express.Request, res: express.Response) => {
				res.status(200).send("GET website list");
			});
		//TODO: Fix this v
		this.app
			.route("/website/JSON")
			.post((_: express.Request, res: express.Response) => {
				res.status(200).send("ADD new website to list");
			});
		this.app
			.route("/website/:id")
			.put((_: express.Request, res: express.Response) => {
				res.status(200).send("Update new website to list");
			})
			.delete((_: express.Request, res: express.Response) => {
				//This could be just setting the NrOfPages to 0 or remove it completly
				res.status(200).send("Deleting new website from list");
			});
		return this.app;
	}
}
