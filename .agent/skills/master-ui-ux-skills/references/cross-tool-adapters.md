# Cross-Tool Portability Guide (Google Antigravity 2.0, Claude, Cursor, Codex)

The `Master UI/UX Skills` package follows the open Agent Skills specification (`SKILL.md` + `references/`), making it directly portable across all major AI coding environments.

## 1. Google Antigravity 2.0 & Gemini

- **Workspace-Level Installation:** Copy the `.agent/skills/master-ui-ux-skills/` folder into your project root.
- **Global Installation (All Projects):** Copy `master-ui-ux-skills/` into `~/.gemini/antigravity/skills/master-ui-ux-skills/`.
- **How It Triggers:** Antigravity 2.0 automatically indexes the YAML frontmatter in `SKILL.md` and loads `references/*.md` on demand when you ask to design, build, or audit any UI/UX surface.

## 2. Claude Code & Claude Desktop

- **Project-Level Installation:** Copy `.claude/skills/master-ui-ux-skills/` and `CLAUDE.md` into your project root.
- **Personal Global Installation:** Copy `master-ui-ux-skills/` into `~/.claude/skills/master-ui-ux-skills/`.
- **Usage:** Claude Code automatically discovers `SKILL.md` and invokes it on UI/UX prompts, or you can invoke it explicitly via `/master-ui-ux-skills`.

## 3. Cursor IDE

- **Option A (Native Agent Skills - Cursor 2.4+):** Copy `.agents/skills/master-ui-ux-skills/` into your project root.
- **Option B (Cursor `.mdc` Project Rule):** Copy `.cursor/rules/master-ui-ux-skills.mdc` into your project root.

## 4. OpenAI Codex CLI & Universal `AGENTS.md` Tools

- **Skill Directory Installation:** Copy `.agents/skills/master-ui-ux-skills/` and `AGENTS.md` into your project root (or `~/.codex/skills/master-ui-ux-skills/`).
