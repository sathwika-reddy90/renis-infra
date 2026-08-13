type Level = "info" | "step" | "ok" | "warn" | "error" | "skip";

const ICON: Record<Level, string> = {
  info: "·",
  step: "→",
  ok: "✓",
  warn: "!",
  error: "✕",
  skip: "–",
};

const stamp = () => new Date().toISOString().slice(11, 19);

/** Prefixed, timestamped console logger — one line per action taken. */
export class Logger {
  constructor(private readonly scope: string = "") {}

  child(scope: string): Logger {
    return new Logger(this.scope ? `${this.scope} › ${scope}` : scope);
  }

  private write(level: Level, message: string): void {
    const prefix = this.scope ? `[${this.scope}] ` : "";
    console.log(`${stamp()} ${ICON[level]} ${prefix}${message}`);
  }

  info(m: string) { this.write("info", m); }
  step(m: string) { this.write("step", m); }
  ok(m: string) { this.write("ok", m); }
  warn(m: string) { this.write("warn", m); }
  error(m: string) { this.write("error", m); }
  skip(m: string) { this.write("skip", m); }

  rule(title: string): void {
    console.log(`\n${"─".repeat(72)}\n  ${title}\n${"─".repeat(72)}`);
  }
}

export const rootLogger = new Logger();
