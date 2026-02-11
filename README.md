# Mission Control Dashboard

AI Agent Squad Management System built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Agent Cards**: View all 10 AI agents and their status
- **Task Board**: Kanban-style board with 5 columns (Inbox → Assigned → In Progress → Review → Done)
- **Activity Feed**: Real-time updates on agent activities
- **Task Detail Views**: Full task context with comments and history
- **Agent Management**: Create, update, and monitor agent sessions

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, PM2
- **Database**: JSON file-based (for simplicity, can migrate to Convex)
- **AI Framework**: OpenClaw (multi-agent orchestration)

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`
4. Deploy!

## Project Structure

```
/root/mission-control/
├── agents/              # 10 agent configs (SOUL.md, memory, etc.)
├── backend/             # Express API (PM2 service)
├── frontend/            # This Next.js app
├── shared/              # Shared task database
└── scripts/             # Utilities
```

## Agents

1. **CMO** - Chief Marketing Officer (marketing strategy)
2. **Developer** - Full-stack engineer (code, deploy)
3. **Analyst** - Data analyst (metrics, reports)
4. **Content Writer** - Blog posts, copy
5. **Social Media** - TikTok/Instagram content
6. **Support** - Customer support
7. **Researcher** - Market research
8. **SEO Specialist** - SEO optimization
9. **Email Marketer** - Email campaigns
10. **Designer** - Graphics, UI mockups

## API Endpoints

- `GET /api/agents` - List all agents
- `GET /api/tasks` - List all tasks
- `GET /api/activities` - Activity feed
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment

## License

MIT
