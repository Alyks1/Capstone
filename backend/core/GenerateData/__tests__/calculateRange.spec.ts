import { isRange, averageRange, chooseRangeTesting, convertToNumbersTesting } from '../calculateRange';
const { chooseRange } = chooseRangeTesting;
const { convertToNumbers } = convertToNumbersTesting;

describe('isRange', () => {
    it('should return true for a string with a hyphen and a number', () => {
        expect(isRange('1-2')).toBe(true);
    });
    it('should return false for a string with a hyphen but no number', () => {
        expect(isRange('a-b')).toBe(false);
    });
    it('should return false for a string with a number and no hyphen', () => {
        expect(isRange('a1')).toBe(false);
    });
    it('should return false for a string with no number or hyphen', () => {
        expect(isRange('a')).toBe(false);
    });
    it('should return false for a number with no hyphen', () => {
        expect(isRange('12')).toBe(false);
    });
});

describe('averageRange', () => {
    it('should average a range 1-2', () => {
        expect(averageRange({ date: '1-2', trust: 0, pos: 0 }, 'word').date).toEqual("1.5");
    });
    it('should average a range of -1-2', () => {
        expect(averageRange({ date: '-1-2', trust: 0, pos: 0 }, 'word').date).toEqual("0.5");
    });
    it('should average a range of -2 & 3', () => {
        expect(averageRange({ date: '-2', trust: 0, pos: 0 }, '3').date).toEqual("0.5");
    });
});

describe('chooseRange', () => {
    it('should split a string with a hyphen', () => {
        expect(chooseRange({ date: '1-2', trust: 0, pos: 0 }, 'word')).toEqual(['1', '2']);
    });
    it('should split a string with a hyphen', () => {
        expect(chooseRange({ date: '-2-3', trust: 0, pos: 0 }, 'word')).toEqual(['-2', '3']);
    });
    it('should not split, but use the next word as the second number', () => {
        expect(chooseRange({ date: '-2', trust: 0, pos: 0 }, '3')).toEqual(['-2', '3']);
    });
    it('should not split, but use the next word as the second number', () => {
        expect(chooseRange({ date: '-4', trust: 0, pos: 0 }, '-3')).toEqual(['-4', '-3']);
    });
});

describe('convertToNumbers', () => {
    it('should convert 1 & 2 to a number', () => {
        expect(convertToNumbers(['1', '2'], { date: '1-2', trust: 0, pos: 0 })).toEqual([1, 2]);
    });
    it('should convert -1 & 2', () => {
        expect(convertToNumbers(['-1', '2'], { date: '-1-2', trust: 0, pos: 0 })).toEqual([-1, 2]);
    });
    it('should convert -2 & -1', () => {
        expect(convertToNumbers(['-2', '-1'], { date: '-1-2', trust: 0, pos: 0 })).toEqual([-2, -1]);
    });
});