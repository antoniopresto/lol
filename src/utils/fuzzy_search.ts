export interface FuzzyResult {
  score: number;
  indices: number[];
}

const SCORE_CONSECUTIVE = 8;
const SCORE_WORD_BOUNDARY = 10;
const SCORE_FIRST_CHAR = 12;
const SCORE_MATCH = 1;
const PENALTY_GAP_START = -3;
const PENALTY_GAP = -1;
const SCORE_CASE_MATCH = 1;
const MAX_RECURSION_CALLS = 10_000;
const INITIAL_PREV_MATCH = -2;

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9';
}

function isWordBoundary(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text[index - 1]!;
  const curr = text[index]!;
  if (prev === ' ' || prev === '_' || prev === '-' || prev === '.') {
    return true;
  }
  if (
    prev === prev.toLowerCase() &&
    curr === curr.toUpperCase() &&
    curr !== curr.toLowerCase()
  )
    return true;
  if (isDigit(prev) !== isDigit(curr)) return true;
  return false;
}

export function fuzzyScore(query: string, text: string): FuzzyResult | null {
  if (!query)
    return {
      score: 0,
      indices: [],
    };
  if (!text) return null;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let qi = 0;
  for (let ti = 0; ti < textLower.length && qi < queryLower.length; ti++) {
    if (textLower[ti] === queryLower[qi]) qi++;
  }
  if (qi < queryLower.length) return null;

  const bestResult = findBestMatch(queryLower, text, textLower, query);
  return bestResult;
}

function greedyMatch(
  queryLower: string,
  text: string,
  textLower: string,
  originalQuery: string
): FuzzyResult {
  const indices: number[] = [];
  let qi = 0;
  for (let ti = 0; ti < textLower.length && qi < queryLower.length; ti++) {
    if (textLower[ti] === queryLower[qi]) {
      indices.push(ti);
      qi++;
    }
  }
  return {
    score: computeScore(indices, text, textLower, originalQuery),
    indices,
  };
}

function findBestMatch(
  queryLower: string,
  text: string,
  textLower: string,
  originalQuery: string
): FuzzyResult | null {
  let bestScore = -Infinity;
  let bestIndices: number[] = [];
  let callCount = 0;

  function recurse(
    qi: number,
    ti: number,
    indices: number[],
    prevMatchIndex: number
  ): void {
    if (++callCount > MAX_RECURSION_CALLS) return;

    if (qi === queryLower.length) {
      const score = computeScore(indices, text, textLower, originalQuery);
      if (score > bestScore) {
        bestScore = score;
        bestIndices = [...indices];
      }
      return;
    }

    const remaining = queryLower.length - qi;
    const available = textLower.length - ti;
    if (remaining > available) return;

    let branchCount = 0;
    const maxBranches = 4;

    for (let i = ti; i < textLower.length && branchCount < maxBranches; i++) {
      if (textLower[i] === queryLower[qi]) {
        indices.push(i);
        recurse(qi + 1, i + 1, indices, i);
        indices.pop();
        branchCount++;

        if (isWordBoundary(text, i) || i === prevMatchIndex + 1) {
          break;
        }
      }
    }
  }

  recurse(0, 0, [], INITIAL_PREV_MATCH);

  if (bestScore === -Infinity) {
    return greedyMatch(queryLower, text, textLower, originalQuery);
  }
  return {
    score: bestScore,
    indices: bestIndices,
  };
}

function computeScore(
  indices: number[],
  text: string,
  textLower: string,
  originalQuery: string
): number {
  let score = 0;

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i]!;

    score += SCORE_MATCH;

    if (i === 0 && idx === 0) {
      score += SCORE_FIRST_CHAR;
    }

    if (isWordBoundary(text, idx)) {
      score += SCORE_WORD_BOUNDARY;
    }

    if (i > 0 && idx === indices[i - 1]! + 1) {
      score += SCORE_CONSECUTIVE;
    }

    if (i > 0) {
      const gap = idx - indices[i - 1]! - 1;
      if (gap > 0) {
        score += PENALTY_GAP_START + PENALTY_GAP * (gap - 1);
      }
    }

    if (text[idx] === originalQuery[i]) {
      score += SCORE_CASE_MATCH;
    }

    const positionBonus = 1 - idx / text.length;
    score += positionBonus * 2;
  }

  if (textLower === originalQuery.toLowerCase()) {
    score += 50;
  }

  return score;
}

export function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  if (!text) return false;
  const ql = query.toLowerCase();
  const tl = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < tl.length && qi < ql.length; ti++) {
    if (tl[ti] === ql[qi]) qi++;
  }
  return qi === ql.length;
}

export interface FuzzySearchItem<T> {
  item: T;
  texts: string[];
}

export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  matchedField: number;
  indices: number[];
}

export function fuzzySearchItems<T>(
  query: string,
  items: FuzzySearchItem<T>[],
): FuzzySearchResult<T>[] {
  if (!query) {
    return items.map(({ item }) => ({
      item,
      score: 0,
      matchedField: 0,
      indices: [],
    }));
  }

  const results: FuzzySearchResult<T>[] = [];

  for (const { item, texts } of items) {
    let bestScore = -Infinity;
    let bestField = 0;
    let bestIndices: number[] = [];

    for (let f = 0; f < texts.length; f++) {
      const text = texts[f];
      if (!text) continue;
      const result = fuzzyScore(query, text);
      if (result && result.score > bestScore) {
        bestScore = result.score;
        bestField = f;
        bestIndices = result.indices;
      }
    }

    if (bestScore > -Infinity) {
      results.push({
        item,
        score: bestScore,
        matchedField: bestField,
        indices: bestIndices,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
