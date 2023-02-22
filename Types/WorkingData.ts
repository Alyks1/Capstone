export class WorkingData {
    dates: string[];
    reversedDates: string[];
    WorkingDates: string[];
    yearLabels: string[];
    centuries: boolean[];

    trust: number;
}

/*
    Trust:
    Trust is the number used to represent how trusted the data is. 
    It works as a weight and the higher the trust the better.

    Initial Idea is to use trust 1:1. This would mean that the higher the trust, 
    the more frequently the data is present in the dataset.
*/