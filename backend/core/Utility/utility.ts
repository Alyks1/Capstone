export class Utility {
	static sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	static makeBold(string: string) {
		return `\x1B[1m${string}\x1B[0m`;
	}

	static sanatizeText(text: string) {
		return text
			.replace(/[–/~]/g, "-")
			.replace(/[.,;]/g, "")
			.replace(/([\(\[])([0-9])*([x× ])+[0-9]*([\)\]])/g, "") //Remove img resolution eg (1080x960)
			.replace(/([\(\[\)\]])/g, "")
			.replace(/(\bBCE\b)/gi, "BC") //Replace BCE with BC
			.replace(/(\bCE\b)/gi, "AD")
			.replace(/(st|nd|rd|th)/gi, "") //Replace CE with AD
			.toLowerCase();
	}

	static isNumber(str: string) {
		return !isNaN(+str);
	}
}