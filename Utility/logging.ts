import { parseArgs } from "node:util";

enum Loglevel {
	Trace = 1,
	Debug,
	Info,
}

const loglevels: Record<string, Loglevel> = {
	trace: Loglevel.Trace,
	debug: Loglevel.Debug,
	info: Loglevel.Info,
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

	static Info(string) {
		if (this.loglevel < 4) console.log(`${string}\x1b[0m`);
	}

	static Debug(string) {
		if (this.loglevel < 3) {
			console.log(`\x1b[33m${string}\x1b[0m`);
		}
	}

	static Trace(string) {
		if (this.loglevel < 2) {
			console.log(`   | \x1b[36m${string}\x1b[0m`);
		}
	}
}
