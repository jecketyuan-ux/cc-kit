import { Command } from "commander";
import { runDoctor, printDoctorReport } from "./commands/doctor.ts";
import { initProject, printInitResult } from "./commands/init.ts";
import {
  addSkill,
  listSkills,
  printAddResult,
  removeSkill,
} from "./commands/skill.ts";
import { VERSION } from "./version.ts";

const program = new Command();

program
  .name("cc-kit")
  .description(
    "Claude Code Kit — bootstrap, install, and validate skills, hooks, and CLAUDE.md. Local filesystem only; no telemetry or API keys.",
  )
  .version(VERSION);

program
  .command("init")
  .description("Scaffold .claude/ with CLAUDE.md, example hooks, and one example skill")
  .option("-f, --force", "Overwrite existing CLAUDE.md and generated files", false)
  .option("-C, --cwd <path>", "Project directory", process.cwd())
  .action((opts: { force?: boolean; cwd: string }) => {
    const result = initProject({ cwd: opts.cwd, force: opts.force });
    printInitResult(result);
  });

const skill = program.command("skill").description("List, add, or remove Claude Code skills");

skill
  .command("list")
  .description("List installed skills (project and personal)")
  .option("-g, --global", "List personal skills only (~/.claude/skills/)", false)
  .option("-p, --project", "List project skills only (.claude/skills/)", false)
  .option("--json", "Print JSON", false)
  .option("-C, --cwd <path>", "Project directory", process.cwd())
  .action((opts: { global?: boolean; project?: boolean; json?: boolean; cwd: string }) => {
    listSkills(opts);
  });

skill
  .command("add")
  .description(
    "Add a skill from a local path, starter pack name, or git URL into .claude/skills/ (or ~/.claude/skills/ with --global)",
  )
  .argument("<source>", "Local path, pack name (pr-review), or git URL [owner/repo[#path]]")
  .option("-g, --global", "Install into ~/.claude/skills/", false)
  .option("-n, --name <name>", "Override the skill directory name")
  .option("-f, --force", "Overwrite an existing skill with the same name", false)
  .option("-C, --cwd <path>", "Project directory", process.cwd())
  .action(
    (
      source: string,
      opts: { global?: boolean; name?: string; force?: boolean; cwd: string },
    ) => {
      const result = addSkill(source, opts);
      printAddResult(result, Boolean(opts.global));
    },
  );

skill
  .command("remove")
  .description("Remove an installed skill by name")
  .argument("<name>", "Skill directory name")
  .option("-g, --global", "Remove from ~/.claude/skills/", false)
  .option("-C, --cwd <path>", "Project directory", process.cwd())
  .action((name: string, opts: { global?: boolean; cwd: string }) => {
    const dest = removeSkill(name, opts);
    console.log(`✓ removed ${dest}`);
  });

program
  .command("doctor")
  .description("Validate SKILL.md frontmatter, hooks JSON shape, and report missing pieces")
  .option("-g, --global", "Also check personal skills in ~/.claude/skills/", false)
  .option("--no-packs", "Skip bundled packs/ skills")
  .option("-C, --cwd <path>", "Project directory", process.cwd())
  .action((opts: { global?: boolean; packs?: boolean; cwd: string }) => {
    const report = runDoctor({
      cwd: opts.cwd,
      global: opts.global,
      packs: opts.packs,
    });
    printDoctorReport(report);
    process.exitCode = report.ok ? 0 : 1;
  });

program.configureHelp({
  sortSubcommands: true,
});

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`cc-kit: ${message}`);
    process.exitCode = 1;
  }
}

void main();
