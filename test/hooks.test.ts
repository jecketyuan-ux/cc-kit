import { describe, expect, it } from "vitest";
import { parseSettingsJson, SettingsParseError, validateHooksShape } from "../src/lib/hooks.js";

const VALID_HOOKS = {
  SessionStart: [
    {
      hooks: [{ type: "command", command: "echo hi" }],
    },
  ],
  PostToolUse: [
    {
      matcher: "Write|Edit",
      hooks: [{ type: "command", command: "echo changed" }],
    },
  ],
};

describe("parseSettingsJson", () => {
  it("parses a settings object and exposes hooks", () => {
    const { document } = parseSettingsJson(JSON.stringify({ hooks: VALID_HOOKS }));
    expect(document.hooks).toEqual(VALID_HOOKS);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseSettingsJson("{")).toThrow(SettingsParseError);
  });

  it("rejects a JSON array", () => {
    expect(() => parseSettingsJson("[]")).toThrow(/object/i);
  });
});

describe("validateHooksShape", () => {
  it("accepts the official matcher-group shape", () => {
    const diags = validateHooksShape(VALID_HOOKS);
    expect(diags.filter((d) => d.severity === "error")).toEqual([]);
  });

  it("warns when hooks is missing", () => {
    const diags = validateHooksShape(undefined);
    expect(diags.some((d) => d.code === "missing-hooks")).toBe(true);
  });

  it("errors when hooks is not an object", () => {
    const diags = validateHooksShape([]);
    expect(diags.some((d) => d.code === "hooks-not-object" && d.severity === "error")).toBe(true);
  });

  it("errors when an event value is not an array", () => {
    const diags = validateHooksShape({ PreToolUse: { matcher: "Bash" } });
    expect(diags.some((d) => d.code === "hook-event-not-array")).toBe(true);
  });

  it("errors when a command handler is missing command", () => {
    const diags = validateHooksShape({
      Stop: [{ hooks: [{ type: "command" }] }],
    });
    expect(diags.some((d) => d.code === "missing-command")).toBe(true);
  });

  it("errors when a handler is missing type", () => {
    const diags = validateHooksShape({
      Stop: [{ hooks: [{ command: "echo" }] }],
    });
    expect(diags.some((d) => d.code === "missing-handler-type")).toBe(true);
  });

  it("warns on unknown event names", () => {
    const diags = validateHooksShape({
      NotARealEvent: [{ hooks: [{ type: "command", command: "true" }] }],
    });
    expect(diags.some((d) => d.code === "unknown-hook-event")).toBe(true);
  });
});
