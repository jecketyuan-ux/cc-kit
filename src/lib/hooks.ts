import { HOOK_EVENTS, HOOK_HANDLER_TYPES, type Diagnostic } from "./types.js";

const KNOWN_EVENTS = new Set<string>(HOOK_EVENTS);
const KNOWN_TYPES = new Set<string>(HOOK_HANDLER_TYPES);

export interface SettingsDocument {
  raw: unknown;
  hooks?: unknown;
}

export function parseSettingsJson(text: string): { document: SettingsDocument } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new SettingsParseError(`settings.json is not valid JSON: ${message}`);
  }
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new SettingsParseError("settings.json must be a JSON object");
  }
  const record = raw as Record<string, unknown>;
  return { document: { raw, hooks: record.hooks } };
}

export class SettingsParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsParseError";
  }
}

/**
 * Validate Claude Code hooks configuration shape:
 * hooks → event name → matcher groups[] → { matcher?, hooks: handler[] }
 */
export function validateHooksShape(hooks: unknown, settingsPath?: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const at = settingsPath ?? "settings.json";

  if (hooks == null) {
    diagnostics.push({
      severity: "warning",
      code: "missing-hooks",
      message: "settings.json has no `hooks` key",
      path: at,
    });
    return diagnostics;
  }

  if (typeof hooks !== "object" || Array.isArray(hooks)) {
    diagnostics.push({
      severity: "error",
      code: "hooks-not-object",
      message: "`hooks` must be an object keyed by event name",
      path: at,
    });
    return diagnostics;
  }

  const events = Object.entries(hooks as Record<string, unknown>);
  if (events.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "empty-hooks",
      message: "`hooks` is an empty object",
      path: at,
    });
    return diagnostics;
  }

  for (const [eventName, groups] of events) {
    const eventPath = `${at}#hooks.${eventName}`;
    if (!KNOWN_EVENTS.has(eventName)) {
      diagnostics.push({
        severity: "warning",
        code: "unknown-hook-event",
        message: `unknown hook event "${eventName}" (may be a newer Claude Code event)`,
        path: eventPath,
      });
    }

    if (!Array.isArray(groups)) {
      diagnostics.push({
        severity: "error",
        code: "hook-event-not-array",
        message: `hooks.${eventName} must be an array of matcher groups`,
        path: eventPath,
      });
      continue;
    }

    groups.forEach((group, groupIndex) => {
      validateMatcherGroup(group, `${eventPath}[${groupIndex}]`, diagnostics);
    });
  }

  return diagnostics;
}

function validateMatcherGroup(
  group: unknown,
  path: string,
  diagnostics: Diagnostic[],
): void {
  if (group == null || typeof group !== "object" || Array.isArray(group)) {
    diagnostics.push({
      severity: "error",
      code: "matcher-group-not-object",
      message: "each matcher group must be an object",
      path,
    });
    return;
  }

  const record = group as Record<string, unknown>;

  if (record.matcher != null && typeof record.matcher !== "string") {
    diagnostics.push({
      severity: "error",
      code: "invalid-matcher",
      message: "`matcher` must be a string when present",
      path: `${path}.matcher`,
    });
  }

  if (record.hooks == null) {
    diagnostics.push({
      severity: "error",
      code: "missing-group-hooks",
      message: "matcher group is missing required `hooks` array",
      path,
    });
    return;
  }

  if (!Array.isArray(record.hooks)) {
    diagnostics.push({
      severity: "error",
      code: "group-hooks-not-array",
      message: "matcher group `hooks` must be an array of handlers",
      path: `${path}.hooks`,
    });
    return;
  }

  if (record.hooks.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "empty-group-hooks",
      message: "matcher group `hooks` array is empty",
      path: `${path}.hooks`,
    });
  }

  record.hooks.forEach((handler, index) => {
    validateHandler(handler, `${path}.hooks[${index}]`, diagnostics);
  });
}

function validateHandler(handler: unknown, path: string, diagnostics: Diagnostic[]): void {
  if (handler == null || typeof handler !== "object" || Array.isArray(handler)) {
    diagnostics.push({
      severity: "error",
      code: "handler-not-object",
      message: "each hook handler must be an object",
      path,
    });
    return;
  }

  const record = handler as Record<string, unknown>;
  if (typeof record.type !== "string" || record.type.trim() === "") {
    diagnostics.push({
      severity: "error",
      code: "missing-handler-type",
      message: "hook handler is missing required `type` string",
      path,
    });
    return;
  }

  if (!KNOWN_TYPES.has(record.type)) {
    diagnostics.push({
      severity: "warning",
      code: "unknown-handler-type",
      message: `unknown hook handler type "${record.type}"`,
      path: `${path}.type`,
    });
  }

  if (record.timeout != null && (typeof record.timeout !== "number" || record.timeout <= 0)) {
    diagnostics.push({
      severity: "error",
      code: "invalid-timeout",
      message: "`timeout` must be a positive number of seconds",
      path: `${path}.timeout`,
    });
  }

  switch (record.type) {
    case "command":
      if (typeof record.command !== "string" || record.command.trim() === "") {
        diagnostics.push({
          severity: "error",
          code: "missing-command",
          message: 'handler type "command" requires a non-empty `command` string',
          path: `${path}.command`,
        });
      }
      break;
    case "http":
      if (typeof record.url !== "string" || record.url.trim() === "") {
        diagnostics.push({
          severity: "error",
          code: "missing-url",
          message: 'handler type "http" requires a non-empty `url` string',
          path: `${path}.url`,
        });
      }
      break;
    case "prompt":
      if (typeof record.prompt !== "string" || record.prompt.trim() === "") {
        diagnostics.push({
          severity: "error",
          code: "missing-prompt",
          message: 'handler type "prompt" requires a non-empty `prompt` string',
          path: `${path}.prompt`,
        });
      }
      break;
    case "mcp_tool":
      if (typeof record.tool !== "string" && typeof record.name !== "string") {
        diagnostics.push({
          severity: "error",
          code: "missing-mcp-tool",
          message: 'handler type "mcp_tool" requires a `tool` or `name` string',
          path,
        });
      }
      break;
    case "agent":
      if (record.prompt != null && typeof record.prompt !== "string") {
        diagnostics.push({
          severity: "error",
          code: "invalid-agent-prompt",
          message: 'handler type "agent" `prompt` must be a string when present',
          path: `${path}.prompt`,
        });
      }
      break;
    default:
      break;
  }
}
