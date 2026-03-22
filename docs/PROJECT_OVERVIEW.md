# SkillHub Project Overview

SkillHub is an IT-hackathon matching platform for participants and teams.

## What the product does

- helps participants build a visible profile
- imports public GitHub data into the profile
- calculates an AI rating and recommendations
- lets people discover participants and teams
- supports favorites, votes, and direct profile viewing
- lets captains manage team membership and recruitment status

## Current audience

- hackathon participants who want a clearer profile
- captains who need to compare candidates quickly
- organizers or judges who want a readable demo and a consistent story

## Current stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express
- Storage: PostgreSQL with an in-memory demo fallback
- Integrations: GitHub OAuth, GitHub REST API, YandexGPT

## Main product loops

1. Sign in with GitHub.
2. Review or edit your profile.
3. Import GitHub data to fill stack and project hints.
4. Run AI scoring to get a rating and recommendations.
5. Search for people or teams and interact with them.

