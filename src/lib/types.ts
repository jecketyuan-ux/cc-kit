export type Severity = "error" | "warning" | "info";

export interface Diagnostic {
  severity: Severity;
  code: string;
  message: string;
  path?: string;
}

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ParsedSkillMarkdown {
  frontmatter: SkillFrontmatter;
  body: string;
  rawFrontmatter: string;
}

export interface SkillInfo {
  name: string;
  directory: string;
  skillFile: string;
  scope: SkillScope;
  description?: string;
  valid: boolean;
  diagnostics: Diagnostic[];
}

export type SkillScope = "project" | "personal" | "pack";

export interface FrontmatterIssue {
  code: string;
  message: string;
}

export const HOOK_EVENTS = [
  "SessionStart",
  "SessionEnd",
  "Setup",
  "UserPromptSubmit",
  "UserPromptExpansion",
  "PreToolUse",
  "PermissionRequest",
  "PermissionDenied",
  "PostToolUse",
  "PostToolUseFailure",
  "PostToolBatch",
  "Notification",
  "MessageDisplay",
  "SubagentStart",
  "SubagentStop",
  "TaskCreated",
  "TaskCompleted",
  "Stop",
  "StopFailure",
  "TeammateIdle",
  "InstructionsLoaded",
  "ConfigChange",
  "CwdChanged",
  "DirectoryAdded",
  "FileChanged",
  "WorktreeCreate",
  "WorktreeRemove",
  "PreCompact",
  "PostCompact",
  "PreModelSwitch",
  "PostModelSwitch",
  "Elicitation",
  "ElicitationResult",
] as const;

export type HookEvent = (typeof HOOK_EVENTS)[number];

export const HOOK_HANDLER_TYPES = [
  "command",
  "http",
  "prompt",
  "agent",
  "mcp_tool",
] as const;

export type HookHandlerType = (typeof HOOK_HANDLER_TYPES)[number];
