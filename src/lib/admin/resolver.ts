import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodTypeAny } from "zod";

/**
 * Minimal zod → react-hook-form resolver (avoids an extra dependency).
 * Builds the nested error object RHF expects from zod issue paths.
 */
export function zodResolver<T extends FieldValues>(schema: ZodTypeAny): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as T, errors: {} };
    }

    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      const segments = issue.path.map(String);
      if (segments.length === 0) continue;
      let node = errors;
      for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (typeof node[seg] !== "object" || node[seg] === null) node[seg] = {};
        node = node[seg] as Record<string, unknown>;
      }
      const leaf = segments[segments.length - 1];
      if (!node[leaf]) node[leaf] = { type: issue.code, message: issue.message };
    }
    return { values: {} as T, errors: errors as never };
  };
}
