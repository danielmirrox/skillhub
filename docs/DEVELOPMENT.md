# SkillHub Development Guide

## Everyday commands

- `cd client && npm install && npm run dev`
- `cd server && npm install && npm run dev`
- `cd client && npm run build`
- `cd server && npm run smoke`

## Working style

- keep feature changes aligned between client and server
- prefer updating the server contract before polishing the UI
- avoid duplicating business rules in the frontend
- keep demo data and production behavior close enough for a believable walkthrough

## Branching

- branch names use the `codex/` prefix in this workspace
- short-lived branches are easiest to review and merge

## Verification

- run the client build after UI changes
- check the backend with `node --check` or the server smoke script when routes change
- verify the main product loops: login, profile, search, teams, applications, deployment

