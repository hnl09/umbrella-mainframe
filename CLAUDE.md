# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start:dev     # Start with watch mode (development)
pnpm build         # Compile TypeScript
pnpm start:prod    # Run compiled build
pnpm lint          # ESLint with auto-fix
pnpm format        # Prettier format
pnpm test          # Jest unit tests
pnpm test:cov      # Tests with coverage
pnpm test:e2e      # End-to-end tests
```

## Architecture

NestJS bot that tracks a League of Legends player's matches and posts Discord notifications. Runs on a Raspberry Pi — prioritize performance (Promise.all, avoid extra API calls).

### Module Flow

```
MatchTrackerModule (cron every 1 min)
  → RiotService     — Riot Games API client
  → DiscordService  — Discord bot (discord.js v14)
  → Match repo      — SQLite via TypeORM (deduplication)
```

**AppController** exposes `GET /` (status) and `POST /scan` (manual trigger).

### Riot API URL Split

Two base URLs are used — do not mix them:
- `regionUrl` (`https://americas.api.riotgames.com`) — Match-V5 endpoints
- `platformUrl` (`https://br1.api.riotgames.com`) — Summoner-V4, League-V4, Spectator-V5

### Polling & State

- `MatchTrackerService` uses `@Cron(CronExpression.EVERY_MINUTE)` with an `isProcessing` boolean guard to prevent overlapping runs.
- Match deduplication is done via the `Match` entity (`matchId` primary key in `red-queen.db`).
- In-memory state (e.g., `activeGameId`) is preferred over DB for transient runtime state.

### Discord Embeds

Built with `EmbedBuilder` in `DiscordService`. All notifications use a "RED QUEEN" / Resident Evil theme. Footer: `"You're all going to die down here."`. Color `0xFF0000` (red).

## Environment Variables

All are required (`getOrThrow` will throw on startup if missing):

| Variable | Purpose |
|----------|---------|
| `DISCORD_TOKEN` | Discord bot token |
| `CHANNEL_ID` | Target Discord channel ID |
| `RIOT_API_KEY` | Riot Games API key |
| `MY_PUUID` | Tracked player's PUUID |
| `RIOT_REGION` | Match-V5 region (e.g. `americas`) |
| `RIOT_PLATFORM` | Platform endpoint (e.g. `br1`) |
| `PORT` | HTTP server port (default `3000`) |
