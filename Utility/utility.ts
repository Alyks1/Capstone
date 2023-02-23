export class Utility {
    static difference(a: number, b: number) {
        return Math.abs(a - b);
    }

    static getDifferences(data: string[]): number[] {
        let result: number[] = []
        for (let i = 0; i < data.length; i++) {
            if ((i + 1) < data.length)
                result.push(this.difference(+data[i], +data[i + 1]));
        }
        return result;
    }
}


