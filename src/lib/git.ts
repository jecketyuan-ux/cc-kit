import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GIT_URL_RE =
  /^(?:git@[\w.-]+:[\w./~-]+(?:\.git)?|https?:\/\/[\w.@:/\-?&=%+#.~]+|ssh:\/\/[\w.@:/\-?&=%+#.~]+)$/i;
const GITHUB_SHORTHAND_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export interface GitSource {
  url: string;
  subpath?: string;
  ref?: string;
}

export function isGitSource(source: string): boolean {
  const { url } = splitGitSource(source);
  return GIT_URL_RE.test(url) || GITHUB_SHORTHAND_RE.test(url);
}

export function splitGitSource(source: string): GitSource {
  const hash = source.lastIndexOf("#");
  if (hash === -1) {
    return { url: expandGithubShorthand(source) };
  }
  const url = expandGithubShorthand(source.slice(0, hash));
  const fragment = source.slice(hash + 1);
  if (!fragment) {
    return { url };
  }
  // Allow url#ref:subpath or url#subpath
  const colon = fragment.indexOf(":");
  if (colon !== -1) {
    return {
      url,
      ref: fragment.slice(0, colon) || undefined,
      subpath: fragment.slice(colon + 1) || undefined,
    };
  }
  return { url, subpath: fragment };
}

function expandGithubShorthand(url: string): string {
  if (GITHUB_SHORTHAND_RE.test(url) && !url.includes("://") && !url.startsWith("git@")) {
    return `https://github.com/${url}.git`;
  }
  return url;
}

export function cloneGitSource(source: GitSource): string {
  const dest = mkdtempSync(join(tmpdir(), "cc-kit-clone-"));
  const args = ["clone", "--depth", "1"];
  if (source.ref) {
    args.push("--branch", source.ref);
  }
  args.push(source.url, dest);

  const result = spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || result.stdout || "").trim();
    throw new Error(
      `git clone failed${stderr ? `: ${stderr}` : ""} (is git installed and is the URL reachable?)`,
    );
  }

  return dest;
}
