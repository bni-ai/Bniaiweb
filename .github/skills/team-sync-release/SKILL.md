---
name: team-sync-release
description: "Use when the user wants GitHub, Vercel, and shared collaboration flow to stay aligned for this repo. Covers branch/PR rules, production release checks, and proving whether bni-ai-web.vercel.app is already on the intended commit."
---

# Team Sync Release

Use this skill when the task is about shared development workflow, GitHub/Vercel sync, release readiness, or proving whether production already matches a commit.

## Goals

- Keep GitHub `main` and Vercel production aligned
- Avoid shipping local dirty changes as the normal path
- Give humans one simple collaboration workflow
- Prove release state with repo facts, not guesses

## Repo Facts

- GitHub repo: `https://github.com/bni-ai/Bniaiweb`
- Production site: `https://bni-ai-web.vercel.app/`
- Vercel project: `bni-ai-web`
- Production branch should be `main`

## Default Workflow

1. Check `git status --short`
2. Check current branch with `git branch --show-current`
3. If work is not ready, do not push
4. If work is ready, commit to a feature branch or approved branch
5. Open or update a PR into `main`
6. Review and merge into `main`
7. Confirm Vercel auto-deploy for the merged commit reaches `READY`
8. Confirm production URL responds and the deployment commit SHA matches GitHub `main`

## Hard Rules

- Prefer `GitHub main -> Vercel auto deploy` as the normal production path
- Do not treat `vercel deploy --prod` from a dirty working tree as the normal workflow
- If a manual production deploy was used, explicitly check whether GitHub and production are now diverged
- Before saying "already deployed", verify all three:
  - GitHub `main` contains the target commit
  - Latest Vercel production deployment is `READY`
  - The deployment commit SHA equals GitHub `main`

## Release Check Commands

Run the minimum set:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git rev-parse origin/main
curl -s -o /tmp/bniaiweb-prod.html -w '%{http_code} %{url_effective}\n' --max-time 20 https://bni-ai-web.vercel.app
```

If Vercel token is available, also inspect the latest deployment and compare `githubCommitSha`.

## Human-Facing Answer Format

When reporting release state, keep it blunt:

- `GitHub: synced / not synced`
- `Vercel production: READY / BUILDING / ERROR`
- `Production URL: 200 / not healthy`
- `Same commit: yes / no`

Then give one sentence:

- `現在已經上線`
- `還沒上線，卡在 build`
- `線上和 GitHub 不一致`

## Collaboration Policy To Enforce

- Everyone develops on branches, not directly in `main`
- Every production change should be traceable to a PR or merge commit
- `main` is the only branch that should auto-deploy production
- Preview or local verification should happen before merge when the change is meaningful
- If production data is mutated manually, report exactly what changed

## When To Escalate

Stop and ask before proceeding if:

- The repo has unrelated dirty work you did not author and pushing all of it would be risky
- Vercel production is linked to the wrong repo, wrong branch, or wrong project
- Production is already serving a manual dirty deploy and the user has not said whether to preserve or replace it
