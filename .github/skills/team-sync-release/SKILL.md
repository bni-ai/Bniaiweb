---
name: team-sync-release
description: "Use when the task is about this repo's shared development workflow, GitHub/Vercel sync, release status, or proving whether production already matches a commit. Covers branch/PR rules, main-branch deployment checks, and mismatch detection."
---

# Team Sync Release

Use this skill for Bniaiweb collaboration and release checks.

## Repo Facts

- Repo: `https://github.com/bni-ai/Bniaiweb`
- Production: `https://bni-ai-web.vercel.app/`
- Vercel project: `bni-ai-web`
- Production branch: `main`

Read [CONTRIBUTING.md](../../../CONTRIBUTING.md) when the user wants the full human workflow or team policy.

## Use This Skill When

- The user asks whether GitHub and production are synced
- The user asks whether a commit is already deployed
- The user asks how teammates should collaborate on this repo
- The user asks to push, release, or verify release status
- You suspect a manual Vercel deploy made GitHub and production diverge

## Normal Policy

- Standard path is: `branch -> PR -> merge to main -> Vercel auto deploy`
- `main` is the only production deployment branch
- Do not normalize dirty local `vercel deploy --prod` as the default path
- If a manual production deploy happened, explicitly check whether GitHub and production still match

## Required Checks

Run these before claiming release state:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git rev-parse origin/main
curl -s -o /tmp/bniaiweb-prod.html -w '%{http_code} %{url_effective}\n' --max-time 20 https://bni-ai-web.vercel.app
```

If `VERCEL_TOKEN` is available, inspect the latest production deployment and capture:

- deployment state
- deployment source
- deployment `githubCommitSha`

## Deployment Is Done Only If

All three are true:

1. GitHub `main` already has the target commit
2. Latest Vercel production deployment is `READY`
3. Deployment `githubCommitSha` equals GitHub `main`

## Response Format

Report release state in four blunt lines:

- `GitHub: synced / not synced`
- `Vercel production: READY / BUILDING / ERROR`
- `Production URL: 200 / not healthy`
- `Same commit: yes / no`

Then add one sentence only:

- `現在已經上線`
- `還沒上線，卡在 build`
- `線上和 GitHub 不一致`

## Escalate When

Stop and ask before proceeding if:

- pushing would include unrelated dirty work
- Vercel is linked to the wrong repo, branch, or project
- production currently serves a manual dirty deploy and the user has not said whether to preserve it
