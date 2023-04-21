type DateRange = {
    start: ASTDate;
    end: ASTDate;
  };
  
  enum Era {
    BC = "BC",
    AD = "AD",
  }
  
  interface ASTDate {
    year?: number;
    era?: Era;
    century?: number;
    decade?: number;
    millennium?: number;
    range?: DateRange;
    age?: number;
  }
  
  type DateParserResult = {
    date: ASTDate;
    remainingText: string;
  };
  
  export class DateParser {
    static parse(text: string): DateParserResult {
      const trimmedText = text.trim();
  
      // Check for range of dates
      const rangeSeparatorIndex = trimmedText.indexOf(" to ");
      if (rangeSeparatorIndex !== -1) {
        const startText = trimmedText.slice(0, rangeSeparatorIndex).trim();
        const endText = trimmedText.slice(rangeSeparatorIndex + 3).trim();
        const startResult = this.parse(startText);
        const endResult = this.parse(endText);
        return {
          date: {
            range: {
              start: startResult.date,
              end: endResult.date,
            },
          },
          remainingText: endResult.remainingText,
        };
      }
  
      // Check for age of a date
      const ageSeparatorIndex = trimmedText.indexOf("-year-old");
      if (ageSeparatorIndex !== -1) {
        const ageText = trimmedText.slice(0, ageSeparatorIndex).trim();
        const age = parseInt(ageText, 10);
        if (isNaN(age)) {
          throw new Error(`Invalid age "${ageText}"`);
        }
        return {
          date: {
            age,
          },
          remainingText: trimmedText.slice(ageSeparatorIndex + 9),
        };
      }
  
      // Check for century
      const centuryRegex = /^(\d+)(?:st|nd|rd|th) century (AD|BC)$/i;
      const centuryMatch = trimmedText.match(centuryRegex);
      if (centuryMatch) {
        const century = parseInt(centuryMatch[1], 10);
        const era = centuryMatch[2].toUpperCase() as Era;
        return {
          date: {
            century,
            era,
          },
          remainingText: "",
        };
      }
  
      // Check for decade
      const decadeRegex = /^(\d{3})s(?: (AD|BC))?$/i;
      const decadeMatch = trimmedText.match(decadeRegex);
      if (decadeMatch) {
        const decade = parseInt(decadeMatch[1], 10);
        const era = decadeMatch[2]?.toUpperCase() as Era;
        return {
          date: {
            decade,
            era,
          },
          remainingText: "",
        };
      }
  
      // Check for millennium
      const millenniumRegex = /^(\d+)th millennium(?: (AD|BC))?$/i;
      const millenniumMatch = trimmedText.match(millenniumRegex);
      if (millenniumMatch) {
        const millennium = parseInt(millenniumMatch[1], 10);
        const era = millenniumMatch[2]?.toUpperCase() as Era;
        return {
          date: {
            millennium,
            era,
          },
          remainingText: "",
        };
      }
  
      // Check for year with era
      const yearRegex = /^(\d+) (AD|BC)$/i;
      const yearMatch = trimmedText.match(yearRegex);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10);
        const era = yearMatch[2].toUpperCase() as Era;
        return {
          date: {
            year,
            era,
          },
          remainingText: "",
        };
    }
}}