export interface WorkingData {
    dates?: string[];
    workingDates?: string[];
    yearLabels?: string[];
    centuries?: boolean[];

    /**
     *     Trust:
     * Trust is the number used to represent how trusted the data is. 
     * It works as a weight and the higher the trust the better.
     *
     * Initial Idea is to use trust 1:1. This would mean that the higher the trust, 
     * the more frequently the data is present in the dataset.
     */
    trust?: number;
    date?: string;
}