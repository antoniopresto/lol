#!/usr/bin/env bun

/**
 * Ralph Loop - Automated Claude Code Task Executor
 *
 * Based on Geoffrey Huntley's Ralph Wiggum technique:
 * - Fresh context per iteration (new Claude instance each time)
 * - Memory persists through files only (git, progress.txt)
 * - One task per iteration
 * - Completion signal terminates loop
 *
 * Uses Claude CLI's --output-format stream-json for real-time streaming.
 *
 * @see https://ghuntley.com/ralph/
 */

import { appendFileSync, mkdirSync, renameSync } from 'node:fs';
import { chalk } from 'zx';

const ANSI_REGEX = /\x1B\[[0-9;]*m/g;
const stripAnsi = (s: string): string => s.replace(ANSI_REGEX, '');

function parsePositiveInt(arg: string | undefined, fallback: number): number {
  const parsed = parseInt(arg ?? String(fallback), 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.error(`Error: expected a positive integer, got "${arg}"`);
    process.exit(1);
  }
  return parsed;
}

const LOG_DIR = './.loop';
mkdirSync(LOG_DIR, { recursive: true });

const CONFIG = Object.freeze({
  maxIterations: parsePositiveInt(Bun.argv[2], 100),
  delayBetweenIterations: 1_000,
  progressFile: './.claude/progress.txt',
  iterationTimeout: 600_000,
  logFlushInterval: 2_000,
  exitPattern: /RALPH_STATUS:\s*\{[^}]*"exit":\s*true[^}]*\}/,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function logTimestamp(): string {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)}_${d.toISOString().slice(11, 19).replace(/:/g, '')}`;
}

function logFilePath(slug: string): string {
  return `${LOG_DIR}/${logTimestamp()}_${slug}.log`;
}

class LogBuffer {
  private buf: string[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private path: string;

  constructor(
    initialPath: string,
    private readonly flushMs: number,
  ) {
    this.path = initialPath;
    this.timer = setInterval(() => this.flush(), this.flushMs);
    if (this.timer && typeof this.timer === 'object' && 'unref' in this.timer) {
      (this.timer as NodeJS.Timeout).unref();
    }
  }

  write(raw: string): void {
    this.buf.push(stripAnsi(raw));
  }

  flush(): void {
    if (this.buf.length === 0) return;
    const chunk = this.buf.join('');
    this.buf.length = 0;
    try {
      appendFileSync(this.path, chunk);
    } catch (err) {
      console.error(`[LogBuffer] write failed: ${err}`);
    }
  }

  startNewFile(newPath: string): void {
    this.flush();
    this.path = newPath;
  }

  renameFile(newPath: string): void {
    this.flush();
    try {
      renameSync(this.path, newPath);
      this.path = newPath;
    } catch {}
  }

  currentPath(): string {
    return this.path;
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }
}

const logBuffer = new LogBuffer(
  logFilePath('startup'),
  CONFIG.logFlushInterval,
);

type Color = 'green' | 'yellow' | 'red' | 'blue' | 'blackBright';

function print(message: string, color?: Color): void {
  const colored = color ? chalk[color](message) : message;
  process.stdout.write(colored);
  logBuffer.write(message);
}

function println(message = '', color?: Color): void {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  print(`[${ts}] ${message}\n`, color);
}

function syslog(message = '', color?: Color): void {
  println(`‣ ${message}`, color);
}

const TASK_PROMPT = `
- The FIRST thing you MUST do is write your understanding of each WORKFLOW AND CRITICAL statement
- The SECOND thing you MUST do is write your understanding of the work in progress described in progress.txt
- Only AFTER completing steps above, proceed with the task execution

WORKFLOW:
0. Understand Project
1. Read ./.claude/progress.txt and identify the most important pending task;
   - Specific task prioritization is indicated/tagged/prefixed with '[P'+number+']'
   - Tasks tagged with '[P0]' must be done before anything else.
   - Tasks tagged with P bigger than 999 (e.g. '[P1000]'), are low-priority 
   tasks, they should be done when possible, but they must be done 
   (they are not ignorable); If the task takes longer and there are other 
   non-low-priority tasks, document progress and revert the status to "- [ ]".
   
2. If NO pending tasks exist, plan next improvements, add tasks and stop
3. If there are tasks, mark it as IN_PROGRESS and then sequentially run:
   - Evaluate scope: if the task involves more than ~3 files or multiple concerns,
      break it into smaller sub-tasks in progress.txt BEFORE starting. Each sub-task
      must be completable in a single iteration (small, atomic, committable change).
   - Execute task
   - Run 'bun run check' and fix found issues.     
   - Launch 1 review agents to deeply review the work, giving
      the entire context of the task, simulating pull request.
   - Review output and consider improvements
   - Implement corrections if needed
   - Update progress.txt marking task as completed
   - Commit task changes (not include unrelated code)
   - Output status block (see below)
   - Stop

CRITICAL:
- ALL tasks and instructions are deliberate. 
- No task is optional.
- If more work is necessary, add a new task to the file, set "exit": false, and Stop
- Only set "exit": true when ALL tasks in progress.txt are completed
- Never remove tasks, unless to update status;
- Never include workarounds and add tasks to fix all you found ('as any' for example is a workaround)
- No task should be submitted as "look reasonable." 
- Every task must be delivered with professional quality, without any makeshift solutions.
- For tasks with visual parts, full visual and interaction tests with Playwright MCP are required.
- Never consider any mistake or error to be expected or acceptable.- Never consider any mistake or error to be expected or acceptable.
- Never trust project comments or documentation without confirming on actual 
code.

--------------------------------------------------------------------------------

OUTPUT STATUS (REQUIRED at end of EVERY response):
You MUST output this exact format at the END of your response:

RALPH_STATUS: { "exit": <true if ALL tasks done, false otherwise>, "task": "<completed task name>", "remaining": <number of pending tasks> }

Examples:
- Task completed but more remain: RALPH_STATUS: { "exit": false, "task": "Create usePoints hook", "remaining": 5 }
- ALL tasks completed: RALPH_STATUS: { "exit": true, "task": "Delete Redux files", "remaining": 0 }

`;

interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  name?: string;
  input?: unknown;
  content?:
    | string
    | Array<{
        type: string;
        text?: string;
      }>;
}

interface StreamMessage {
  type: 'system' | 'assistant' | 'user' | 'result' | 'stream_event' | 'message';
  subtype?: string;
  role?: 'assistant' | 'user';
  event?: {
    type: string;
    delta?: {
      type: string;
      text?: string;
    };
  };
  result?: string;
  message?: {
    role?: string;
    content?: ContentBlock[];
  };
  content?: ContentBlock[];
}

interface RalphStatus {
  exit: boolean;
  task: string;
  remaining: number;
}

function parseRalphStatus(output: string): RalphStatus | null {
  const marker = output.lastIndexOf('RALPH_STATUS:');
  if (marker === -1) return null;

  const jsonStart = output.indexOf('{', marker);
  if (jsonStart === -1) return null;

  let depth = 0;
  for (let i = jsonStart; i < output.length; i++) {
    if (output[i] === '{') depth++;
    if (output[i] === '}') depth--;
    if (depth === 0) {
      try {
        const parsed = JSON.parse(output.slice(jsonStart, i + 1));
        if (typeof parsed.exit === 'boolean') {
          return parsed as RalphStatus;
        }
      } catch {}
      return null;
    }
  }
  return null;
}

let currentProc: ReturnType<typeof Bun.spawn> | null = null;

function killCurrentProc(): void {
  if (!currentProc) return;
  try {
    currentProc.kill();
  } catch {}
}

async function checkDependencies(): Promise<void> {
  const result = await Bun.$`which claude`.quiet().nothrow();
  if (result.exitCode !== 0) {
    syslog("ERROR: 'claude' CLI not found. Install Claude Code.", 'red');
    process.exit(1);
  }

  if (!(await Bun.file(CONFIG.progressFile).exists())) {
    syslog(`ERROR: Progress file not found: ${CONFIG.progressFile}`, 'red');
    process.exit(1);
  }
}

interface IterationResult {
  output: string;
  exitCode: number;
  timedOut: boolean;
}

async function runIteration(): Promise<IterationResult> {
  syslog('Executing Claude Code...');

  const proc = Bun.spawn(
    [
      'claude',
      '-p',
      TASK_PROMPT,
      '--verbose',
      '--debug',
      '--dangerously-skip-permissions',
      '--output-format',
      'stream-json',
      '--include-partial-messages',
      '--model=opus',
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdout: 'pipe',
      stderr: 'inherit',
    },
  );

  currentProc = proc;

  const chunks: string[] = [];
  let timedOut = false;
  const decoder = new TextDecoder();
  let buffer = '';
  let blockHasContent = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    syslog('Iteration timeout reached. Killing process...', 'yellow');
    killCurrentProc();
  }, CONFIG.iterationTimeout);

  const reader = proc.stdout.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        let msg: StreamMessage;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }

        if (msg.type === 'stream_event') {
          const evt = msg.event;
          if (!evt) continue;

          if (evt.type === 'content_block_start') {
            blockHasContent = false;
          } else if (evt.type === 'content_block_delta') {
            const text = evt.delta?.text;
            if (text) {
              print(text);
              chunks.push(text);
              blockHasContent = true;
            }
          } else if (evt.type === 'content_block_stop' && blockHasContent) {
            print('\n');
            chunks.push('\n');
            blockHasContent = false;
          }
          continue;
        }

        if (msg.type === 'assistant' || msg.type === 'message') {
          // Content already streamed via content_block_delta events.
          // Only print here as fallback if no streaming occurred.
          const blocks = msg.message?.content ?? msg.content;
          if (!Array.isArray(blocks)) continue;

          for (const block of blocks) {
            if (block.type === 'text' && block.text && chunks.length === 0) {
              print(block.text);
              chunks.push(block.text);
              print('\n');
              chunks.push('\n');
            }
          }
          continue;
        }

        if (msg.type === 'user') {
          const blocks = msg.message?.content ?? msg.content;
          if (!Array.isArray(blocks)) continue;

          for (const block of blocks) {
            //
            // Handling tool result
            if (block.type === 'tool_result' && block.content) {
              const rawContent =
                typeof block.content === 'string'
                  ? block.content
                  : block.content
                      .map(c => c.text ?? '')
                      .filter(Boolean)
                      .join('\n');

              if (!rawContent) continue;

              let trimmed = rawContent.trim().slice(0, 320);

              const toolResult =
                trimmed && trimmed !== rawContent
                  ? trimmed.split('\n').slice(0, 3).join('\n') + ' [...]'
                  : rawContent;

              println(`\n${toolResult.trimEnd()}\n`, 'blackBright');
              chunks.push('\n', rawContent, '\n');
            }
          }
          continue;
        }

        if (msg.type === 'result' && msg.result) {
          if (chunks.length === 0) {
            chunks.push(msg.result);
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        const msg: StreamMessage = JSON.parse(buffer);
        if (msg.type === 'result' && msg.result && chunks.length === 0) {
          chunks.push(msg.result);
        }
      } catch {}
    }
  } finally {
    clearTimeout(timeoutId);
    reader.releaseLock();
    currentProc = null;
    logBuffer.flush();
  }

  const output = chunks.join('');

  if (timedOut) {
    return {
      output,
      exitCode: 124,
      timedOut: true,
    };
  }

  const exitCode = await proc.exited;
  println();
  return {
    output,
    exitCode,
    timedOut: false,
  };
}

function printHeader(): void {
  println();
  println('==========================================', 'blue');
  println('   Ralph Loop - Bun.js Edition', 'blue');
  println('==========================================', 'blue');
  println(`Max iterations: ${chalk.yellow(CONFIG.maxIterations)}`);
  println(`Log dir:        ${chalk.yellow(LOG_DIR)}`);
  println(
    `Iter delay:     ${chalk.yellow(`${CONFIG.delayBetweenIterations / 1_000}s`)}`,
  );
  println(
    `Iter timeout:   ${chalk.yellow(`${CONFIG.iterationTimeout / 60_000}min`)}`,
  );
  println();
}

async function main(): Promise<void> {
  let cleanupCalled = false;

  const cleanup = (signal: string) => {
    if (cleanupCalled) return;
    cleanupCalled = true;
    println();
    syslog(`Interrupted by ${signal}. Cleaning up...`);
    killCurrentProc();
    logBuffer.dispose();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };

  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));

  await checkDependencies();

  printHeader();
  syslog('Starting automated task loop...');

  let consecutiveFailures = 0;
  const MAX_CONSECUTIVE_FAILURES = 3;

  for (let iteration = 1; iteration <= CONFIG.maxIterations; iteration++) {
    logBuffer.startNewFile(logFilePath(`iter-${iteration}`));

    println();
    println('==========================================', 'green');
    syslog(`Iteration #${iteration} / ${CONFIG.maxIterations}`, 'green');
    syslog(`Log: ${logBuffer.currentPath()}`, 'green');
    println('==========================================', 'green');
    println();

    const { output, exitCode, timedOut } = await runIteration();

    if (exitCode === 0) {
      syslog('Claude Code completed successfully', 'green');
      consecutiveFailures = 0;
    } else if (timedOut) {
      syslog(
        'Iteration timed out — progress may persist in progress.txt',
        'yellow',
      );
    } else {
      syslog(`Claude Code exited with code ${exitCode}`, 'yellow');
      consecutiveFailures++;
    }

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      println();
      println('==========================================', 'red');
      syslog(
        `${MAX_CONSECUTIVE_FAILURES} consecutive failures — aborting loop`,
        'red',
      );
      println('==========================================', 'red');
      logBuffer.renameFile(logFilePath('fatal-consecutive-failures'));
      logBuffer.dispose();
      process.exit(1);
    }

    const status = parseRalphStatus(output);
    const taskSlug = status
      ? slugify(status.task)
      : timedOut
        ? 'timeout'
        : 'no-status';
    logBuffer.renameFile(logFilePath(taskSlug));

    if (status?.exit) {
      println();
      println('==========================================', 'green');
      syslog('ALL TASKS COMPLETED!', 'green');
      syslog(`Final task:      ${status.task}`, 'green');
      syslog(`Remaining:       ${status.remaining}`, 'green');
      syslog(`Total iterations: ${iteration}`, 'green');
      println('==========================================', 'green');
      logBuffer.dispose();
      process.exit(0);
    }

    if (status) {
      syslog(
        `Task done: "${status.task}" — ${status.remaining} remaining`,
        'blue',
      );
    } else if (!timedOut && exitCode === 0) {
      syslog(
        'Warning: No RALPH_STATUS found in output. Claude may not have followed the protocol.',
        'yellow',
      );
    }

    if (iteration < CONFIG.maxIterations) {
      const delaySec = CONFIG.delayBetweenIterations / 1_000;
      println();
      syslog(`Waiting ${delaySec}s before next iteration...`);
      await Bun.sleep(CONFIG.delayBetweenIterations);
    }
  }

  println();
  println('==========================================', 'red');
  syslog(`MAX ITERATIONS REACHED (${CONFIG.maxIterations})`, 'red');
  syslog('Loop stopped — tasks may still be pending', 'red');
  println('==========================================', 'red');
  logBuffer.dispose();
  process.exit(1);
}

main();
