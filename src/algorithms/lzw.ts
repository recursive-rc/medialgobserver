import type { AlgorithmResult } from '../types/algorithm';

export interface CodeBookEntry {
  code: number;
  sequence: string;
}

export interface LZWEncodeState {
  codeBook: CodeBookEntry[];
  w: string;
  k: string;
  output: number[];
  input: string;
  currentIndex: number; // Index in the input string
  highlightedSequence?: string;
}

export const LZW_ENCODE_PSEUDOCODE = [
  "Initialize code book",
  "W = \"\"",
  "For each char K in input:",
  "    If WK in code book:",
  "        W = WK",
  "    Else:",
  "        Output code for W",
  "        Add WK to code book",
  "        W = K",
  "Output code for W"
];

// Helper to find code for a string in base ASCII or our custom codebook
// Base ASCII characters have their charCode as their code
const getCode = (str: string, codeBook: CodeBookEntry[]): number | null => {
  if (str.length === 1) {
    return str.charCodeAt(0);
  }
  const entry = codeBook.find(e => e.sequence === str);
  return entry ? entry.code : null;
};

const hasSequence = (str: string, codeBook: CodeBookEntry[]): boolean => {
  if (str.length === 1) return true; // Single chars are implicitly in the code book
  return codeBook.some(e => e.sequence === str);
};

export function runLZWEncode(input: string): AlgorithmResult<LZWEncodeState> {
  const steps: AlgorithmResult<LZWEncodeState> = [];
  
  if (!input) return steps;

  const codeBook: CodeBookEntry[] = [];
  let nextCode = 257; // User explicitly requested new codes to start at 257
  
  let w = "";
  let k = "";
  const output: number[] = [];

  const addStep = (
    highlightedLines: number[],
    explanation: string,
    wVar: string,
    kVar: string,
    currIdx: number,
    highlightSeq: string = ""
  ) => {
    steps.push({
      data: {
        codeBook: [...codeBook],
        w: wVar,
        k: kVar,
        output: [...output],
        input,
        currentIndex: currIdx,
        highlightedSequence: highlightSeq,
      },
      highlightedLines,
      explanation,
      metadata: {
        W: wVar === "" ? '""' : wVar,
        K: kVar === "" ? '""' : kVar,
        WK: wVar + kVar === "" ? '""' : wVar + kVar,
      }
    });
  };

  // 1. Initialize code book
  addStep([1], "Implicitly initialized base ASCII characters in code book. New codes will start at 257.", w, k, -1);

  // 2. W = ""
  addStep([2], "Initialize W to empty string.", w, k, -1);

  // 3. For each character K in input...
  for (let i = 0; i < input.length; i++) {
    k = input[i];
    addStep([3], `Reading next character K = '${k}' at index ${i}.`, w, k, i);

    const wk = w + k;
    
    // 4. If WK exists...
    addStep([4], `Checking if WK ('${wk}') exists in code book.`, w, k, i, wk);

    if (hasSequence(wk, codeBook)) {
      // 5. W = WK
      w = wk;
      addStep([5], `WK ('${wk}') is in code book. Updating W to '${w}'.`, w, k, i, wk);
    } else {
      // 6. Else...
      // 7. Output code for W
      const codeForW = getCode(w, codeBook);
      if (codeForW !== null) {
        output.push(codeForW);
        addStep([7], `WK ('${wk}') is not in the code book. Outputting code for W ('${w}') -> ${codeForW}.`, w, k, i, w);
      }

      // 8. Add WK to code book
      codeBook.push({ code: nextCode, sequence: wk });
      addStep([8], `Adding WK ('${wk}') to the code book with new code ${nextCode}.`, w, k, i, wk);
      nextCode++;

      // 9. W = K
      w = k;
      addStep([9], `Updating W to K ('${k}') to start the next sequence.`, w, k, i, "");
    }
  }

  // 10. Output code for W
  if (w !== "") {
    const codeForW = getCode(w, codeBook);
    if (codeForW !== null) {
      output.push(codeForW);
      addStep([10], `End of input reached. Outputting the code for the remaining W ('${w}') -> ${codeForW}.`, w, k, input.length - 1, w);
    }
  }

  return steps;
}

// ---------------------------------------------------------
// Decoding logic
// ---------------------------------------------------------

export interface LZWDecodeState {
  codeBook: CodeBookEntry[];
  prevCode: number | null;
  currCode: number | null;
  output: string;
  inputCodes: number[];
  currentIndex: number;
}

export const LZW_DECODE_PSEUDOCODE = [
  "Initialize code",
  "Read first code, find its string S",
  "Output S",
  "prevCode = first code",
  "For each next code currCode in input:",
  "    If currCode is in code book:",
  "        S = strings[currCode]",
  "    Else if currCode == nextCode:",
  "        S = strings[prevCode] + strings[prevCode][0]",
  "    Output S",
  "    Add strings[prevCode] + S[0] to code book",
  "    prevCode = currCode"
];

const getStringForCode = (code: number, codeBook: CodeBookEntry[]): string | null => {
  if (code >= 0 && code <= 255) {
    return String.fromCharCode(code);
  }
  const entry = codeBook.find(e => e.code === code);
  return entry ? entry.sequence : null;
};

export function runLZWDecode(inputCodes: number[]): AlgorithmResult<LZWDecodeState> {
  const steps: AlgorithmResult<LZWDecodeState> = [];
  
  if (!inputCodes || inputCodes.length === 0) return steps;

  const codeBook: CodeBookEntry[] = [];
  let nextNewCode = 257; // Match encoding

  let outputStr = "";
  let pCode: number | null = null;
  let cCode: number | null = null;

  const addStep = (
    highlightedLines: number[],
    explanation: string,
    currCode: number | null,
    prevCode: number | null,
    currIdx: number,
    sValue?: string
  ) => {
    steps.push({
      data: {
        codeBook: [...codeBook],
        prevCode,
        currCode,
        output: outputStr,
        inputCodes,
        currentIndex: currIdx,
      },
      highlightedLines,
      explanation,
      metadata: {
        prevCode: prevCode ?? 'null',
        currCode: currCode ?? 'null',
        S: sValue !== undefined ? `"${sValue}"` : 'null',
      }
    });
  };

  // 1. Initialize logic
  addStep([1], "Implicitly initialized base ASCII characters in code book. New codes will start at 257.", null, null, -1);

  // 2. Read first code
  cCode = inputCodes[0];
  let s = getStringForCode(cCode, codeBook);
  
  if (s !== null) {
    addStep([2], `Read first code ${cCode}. Found string S = "${s}".`, cCode, null, 0, s);
    
    // 3. Output S
    outputStr += s;
    addStep([3], `Outputting S: "${s}".`, cCode, null, 0, s);
    
    // 4. prevCode = first code
    pCode = cCode;
    addStep([4], `Set prevCode to ${pCode}.`, cCode, pCode, 0, s);
  }

  // 5. For each next code
  for (let i = 1; i < inputCodes.length; i++) {
    cCode = inputCodes[i];
    addStep([5], `Reading next code: ${cCode} at index ${i}.`, cCode, pCode, i);

    s = null;

    // 6. If currCode in code book
    addStep([6], `Checking if code ${cCode} is in the code book.`, cCode, pCode, i);
    const codeBookStr = getStringForCode(cCode, codeBook);
    
    if (codeBookStr !== null) {
      s = codeBookStr;
      // 7. S = strings[currCode]
      addStep([7], `Code ${cCode} is in code book. S = "${s}".`, cCode, pCode, i, s);
    } else {
      // 8. Else if currCode == nextCode...
      addStep([8], `Code ${cCode} NOT in code book. This is the special case where currCode == nextCode.`, cCode, pCode, i);
      
      const prevStr = getStringForCode(pCode!, codeBook);
      if (prevStr) {
        // 9. S = strings[prevCode] + strings[prevCode][0]
        s = prevStr + prevStr[0];
        addStep([9], `Handling special case: S = strings[prevCode] + strings[prevCode][0] -> "${s}".`, cCode, pCode, i, s);
      }
    }

    if (s !== null) {
      // 10. Output S
      outputStr += s;
      addStep([10], `Outputting S: "${s}".`, cCode, pCode, i, s);

      // 11. Add to code book
      const prevStr = getStringForCode(pCode!, codeBook);
      if (prevStr) {
        const newEntryStr = prevStr + s[0];
        codeBook.push({ code: nextNewCode, sequence: newEntryStr });
        addStep([11], `Adding strings[prevCode] + S[0] ("${newEntryStr}") to code book with new code ${nextNewCode}.`, cCode, pCode, i, s);
        nextNewCode++;
      }
    }
    
    // 12. prevCode = currCode
    pCode = cCode;
    addStep([12], `Setting prevCode to ${pCode} for the next iteration.`, cCode, pCode, i, s);
  }

  return steps;
}
