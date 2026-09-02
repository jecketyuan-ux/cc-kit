import type { Diagnostic, Severity } from "./types.ts";

const MARK: Record<Severity, string> = {
  error: "✗",
  warning: "!",
  info: "•",
};

export function formatDiagnostic(diag: Diagnostic): string {
  const loc = diag.path ? ` (${diag.path})` : "";
  return `${MARK[diag.severity]} [${diag.severity}] ${diag.message}${loc}`;
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === "error");
}

export function countBySeverity(diagnostics: Diagnostic[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
  for (const diag of diagnostics) {
    counts[diag.severity] += 1;
  }
  return counts;
}
