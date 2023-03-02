export interface Website {
	url: string;
	group: string;
	/**
	 * Weight is a nr between 0-1 which is used in calculation with the trust
	 * to weigh the posts. The higher the weight, the more often a post is
	 * found in the dataset.
	 */
	weight: number;
	nrOfPages: number;
}

export interface WebsiteGroupInfo {
	rootDiv: string;
	divIdentifier: string;
	textIdentifier: string;
	imgIdentifier: string;
	nextIdentifier: string;
}
