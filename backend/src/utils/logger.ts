import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const threshold = LEVEL_WEIGHT[env.LOG_LEVEL];

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (LEVEL_WEIGHT[level] < threshold) return;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}`;
  if (meta !== undefined) {
    console[level === "debug" ? "log" : level](`${prefix} ${message}`, meta);
  } else {
    console[level === "debug" ? "log" : level](`${prefix} ${message}`);
  }
}

/** Minimal dependency-free leveled logger. */
export const logger = {
  debug: (message: string, meta?: unknown) => write("debug", message, meta),
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta),
};
