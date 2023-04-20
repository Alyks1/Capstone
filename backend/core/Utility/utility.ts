export class Utility {
	static sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	static makeBold(string: string) {
		return `\x1B[1m${string}\x1B[0m`;
	}

	static sanatizeText(text: string) {
		text = text
			.replace(/[–~]/g, " - ")
			.replace(/\//g, " / ")
			.replace(/[.,;]/g, "")
			.replace(/([\(\[])([0-9])*([x× ])+[0-9]*([\)\]])/g, "") //Remove img resolution eg (1080x960)
			.replace(/([\(\[\)\]])/g, "")
			.replace(/(\bBCE\b)/gi, "BC") //Replace BCE with BC
			.replace(/(\bCE\b)/gi, "AD") //Replace CE with AD
			.replace(/(st|nd|rd|th)/gi, "")
			.replace(/\s+/g, " ")
			.toLowerCase();

		if (text.match(/[0-9]+-[0-9]+/g)) {
			const matchArr = text.match(/[0-9]+-[0-9]+/g);
			let result = "";
			matchArr.forEach((match) => {
				const numbers = match.split("-");
				result = numbers.join(" - ");
			});
			text = text.replace(/[0-9]+-[0-9]+/g, result);
		}
		if (text.match(/[0-9]+-year/g)) {
			const matchArr = text.match(/[0-9]+-year/g);
			let result = "";
			matchArr.forEach((match) => {
				const numbers = match.split("-");
				result = numbers.join(" - ");
			});
			text = text.replace(/[0-9]+-year/g, result);
		}
		return text;
	}

	static isNumber(str: string) {
		return !isNaN(+str);
	}
}
