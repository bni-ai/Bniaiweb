<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `$spectra-*` skills when:

- A discussion needs structure before coding → `$spectra-discuss`
- User wants to plan, propose, or design a change → `$spectra-propose`
- Tasks are ready to implement → `$spectra-apply`
- There's an in-progress change to continue → `$spectra-ingest`
- User asks about specs or how something works → `$spectra-ask`
- Implementation is done → `$spectra-archive`
- Commit only files related to a specific change → `$spectra-commit`

## Use local repo skills when:

- User asks to inspect or deploy this repo on Vercel without CLI → `.agent/skills/vercel-api-deploy/SKILL.md`
- User asks how this repo should coordinate shared development, GitHub sync, or release status → `.github/skills/team-sync-release/SKILL.md`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `$spectra-apply` and `$spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# User Preferences

## Clarify Before Exploring

When the user's request is vague or could be interpreted in multiple ways (e.g., "fix the presentation system," "I can't add/delete content," "the layout is broken"), **ask clarifying questions first** before launching code exploration or reading files. Do not start scanning the codebase or making assumptions about what the user wants.

This saves time and avoids long exploration rounds that turn out to be off-target.

## Deployment Preference

For this repo, when the user asks for Vercel inspection or deployment and explicitly does not want `Vercel CLI`, use the local `vercel-api-deploy` skill and default to Vercel REST API with preview deployments first.
