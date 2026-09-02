export const DEFAULT_SETTINGS_JSON = `{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo \\"[cc-kit] Session started. Review CLAUDE.md and .claude/skills/ before making changes.\\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo \\"[cc-kit] File changed. Run tests if you touched source files.\\""
          }
        ]
      }
    ]
  }
}
`;
