import { parseArgs } from "node:util";
import { Utility } from "./utility";

enum Loglevel {
	Network = 1,
	Trace,
	Debug,
	Info,
	Warn,
}

const loglevels: Record<string, Loglevel> = {
	network: Loglevel.Network,
	trace: Loglevel.Trace,
	debug: Loglevel.Debug,
	info: Loglevel.Info,
	warn: Loglevel.Warn,
};

export class Logger {
	static loglevel: Loglevel = Loglevel.Info;

	static SetLoglevel() {
		const { values } = parseArgs({
			options: {
				loglevel: {
					type: "string",
					short: "l",
				},
			},
		});
		if (loglevels.hasOwnProperty(values.loglevel)) {
			this.loglevel = loglevels[values.loglevel];
		}
	}
	static warn(string) {
		if (this.loglevel < 6)
			console.log(
				`${Utility.makeBold("WARN:")} \x1b[4\x1b[31m${string}\x1b[0m`,
			);
	}

	static info(string) {
		if (this.loglevel < 5)
			console.log(`${Utility.makeBold("INFO:")} ${string}\x1b[0m`);
	}

	static debug(string) {
		if (this.loglevel < 4) {
			console.log(`${Utility.makeBold("DEBUG:")} \x1b[33m${string}\x1b[0m`);
		}
	}

	static trace(string) {
		if (this.loglevel < 3) {
			console.log(`${Utility.makeBold("TRACE:")} \x1b[36m${string}\x1b[0m`);
		}
	}

	static blocking(string) {
		if (this.loglevel < 2) {
			console.log(`${Utility.makeBold("BLOCK:")} \x1b[31m${string}\x1b[0m`);
		}
	}
}
