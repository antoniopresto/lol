type Token =
  | {
      type: 'number';
      value: number;
    }
  | {
      type: 'op';
      value: string;
    }
  | {
      type: 'paren';
      value: '(' | ')';
    }
  | {
      type: 'func';
      value: string;
    };

const FUNCTIONS: Record<string, (n: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  exp: Math.exp,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i]!;

    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let num = '';
      while (i < s.length && ((s[i]! >= '0' && s[i]! <= '9') || s[i] === '.')) {
        num += s[i];
        i++;
      }
      const parsed = parseFloat(num);
      if (isNaN(parsed)) return null;
      tokens.push({
        type: 'number',
        value: parsed,
      });
      continue;
    }

    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
      let word = '';
      while (
        i < s.length &&
        ((s[i]! >= 'a' && s[i]! <= 'z') || (s[i]! >= 'A' && s[i]! <= 'Z'))
      ) {
        word += s[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (CONSTANTS[lower] !== undefined) {
        tokens.push({
          type: 'number',
          value: CONSTANTS[lower],
        });
      } else if (FUNCTIONS[lower]) {
        tokens.push({
          type: 'func',
          value: lower,
        });
      } else {
        return null;
      }
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({
        type: 'paren',
        value: ch,
      });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({
        type: 'op',
        value: ch,
      });
      i++;
      continue;
    }

    if (ch === '%') {
      tokens.push({
        type: 'op',
        value: '%',
      });
      i++;
      continue;
    }

    return null;
  }

  return tokens.length > 0 ? tokens : null;
}

function precedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/' || op === '%') return 2;
  if (op === '^') return 3;
  return 0;
}

function applyOp(op: string, a: number, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? null : a / b;
    case '%':
      return (a * b) / 100;
    case '^':
      return Math.pow(a, b);
    default:
      return null;
  }
}

function parse(tokens: Token[]): number | null {
  let pos = 0;

  function parseExpression(minPrec: number): number | null {
    let left = parseUnary();
    if (left === null) return null;

    while (pos < tokens.length) {
      const token = tokens[pos]!;
      if (token.type !== 'op') break;

      const prec = precedence(token.value);
      if (prec < minPrec) break;

      pos++;
      const right = parseExpression(token.value === '^' ? prec : prec + 1);
      if (right === null) return null;

      const result = applyOp(token.value, left, right);
      if (result === null) return null;
      left = result;
    }

    return left;
  }

  function parseUnary(): number | null {
    const token = tokens[pos];
    if (!token) return null;

    if (token.type === 'op' && token.value === '-') {
      pos++;
      const val = parseUnary();
      return val === null ? null : -val;
    }

    if (token.type === 'op' && token.value === '+') {
      pos++;
      return parseUnary();
    }

    return parsePrimary();
  }

  function parsePrimary(): number | null {
    const token = tokens[pos];
    if (!token) return null;

    if (token.type === 'number') {
      pos++;
      return token.value;
    }

    if (token.type === 'func') {
      const fn = FUNCTIONS[token.value];
      if (!fn) return null;
      pos++;
      if (
        pos >= tokens.length ||
        tokens[pos]!.type !== 'paren' ||
        tokens[pos]!.value !== '('
      ) {
        return null;
      }
      pos++;
      const arg = parseExpression(0);
      if (arg === null) return null;
      if (
        pos >= tokens.length ||
        tokens[pos]!.type !== 'paren' ||
        tokens[pos]!.value !== ')'
      ) {
        return null;
      }
      pos++;
      return fn(arg);
    }

    if (token.type === 'paren' && token.value === '(') {
      pos++;
      const val = parseExpression(0);
      if (val === null) return null;
      if (
        pos >= tokens.length ||
        tokens[pos]!.type !== 'paren' ||
        tokens[pos]!.value !== ')'
      ) {
        return null;
      }
      pos++;
      return val;
    }

    return null;
  }

  const result = parseExpression(0);
  if (result === null || pos !== tokens.length) return null;
  return result;
}

function looksLikeMathExpression(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (/^[a-zA-Z]+$/.test(trimmed)) return false;
  if (/[+\-*/^%]/.test(trimmed) || /\d/.test(trimmed)) return true;
  return false;
}

export function formatResult(value: number): string {
  if (!isFinite(value)) return String(value);
  if (Number.isInteger(value)) return value.toLocaleString('en-US');
  const fixed = value.toFixed(10);
  const trimmed = fixed.replace(/0+$/, '').replace(/\.$/, '');
  const parts = trimmed.split('.');
  if (parts.length === 2 && parts[1]!.length > 6) {
    return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  }
  return trimmed;
}

function normalize(input: string): string {
  return input.replace(/(\d)\s*%\s*of\s+/gi, '$1%');
}

function hasBinaryOperation(tokens: Token[]): boolean {
  for (let i = 1; i < tokens.length; i++) {
    const prev = tokens[i - 1]!;
    const curr = tokens[i]!;
    if (
      curr.type === 'op' &&
      (prev.type === 'number' || (prev.type === 'paren' && prev.value === ')'))
    ) {
      return true;
    }
  }
  return false;
}

export function evaluate(input: string): string | null {
  const trimmed = normalize(input.trim());
  if (!looksLikeMathExpression(trimmed)) return null;

  const tokens = tokenize(trimmed);
  if (!tokens) return null;

  const hasWork =
    hasBinaryOperation(tokens) || tokens.some(t => t.type === 'func');
  if (!hasWork) return null;

  const result = parse(tokens);
  if (result === null || !isFinite(result)) return null;

  return formatResult(result);
}
