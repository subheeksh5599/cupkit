<p align="center">
  <picture>
    <img src="https://img.shields.io/badge/CUPKIT-World_Cup_Agent_SDK-FDE047?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzBmMTcyYSIgZD0iTTEzIDJMMyAxNGg5bC0xIDggMTAtMTJoLTlsMS04eiIvPjwvc3ZnPg==">
  </picture>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Powered_by-Injective-0f172a?style=for-the-badge">
  <img src="https://img.shields.io/badge/Data-FIFA_API-38bdf8?style=for-the-badge">
  <img src="https://img.shields.io/badge/4_Techs-x402_|_CCTP_|_MCP_|_Agent_Skill-475569?style=for-the-badge">
</p>

<h1 align="center">CupKit</h1>
<h3 align="center"><em>One Agent Skill. Four Injective technologies.<br>World Cup data for every AI agent.</em></h3>

<p align="center">
  <strong>The World Cup infrastructure layer for AI agents.<br>Live FIFA data, cross-chain USDC via CCTP, x402 micropayments — one import.<br>Built on Injective.</strong>
</p>

<p align="center">
  <a href="#the-problem">Problem</a> &bull;
  <a href="#the-solution">Solution</a> &bull;
  <a href="#how-it-works">How It Works</a> &bull;
  <a href="#injective-technologies-used">Injective Tech</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#faq">FAQ</a>
</p>

---

## The Problem

Every hackathon project building World Cup tools hits the same wall: they spend 80% of their time wiring up data plumbing instead of building features. FIFA's API, Circle's CCTP contracts, Injective's x402 protocol — each is a separate integration with its own SDK, docs, and gotchas.

| Problem | Impact |
|---------|--------|
| **World Cup data is fragmented** | Scores on FIFA API, standings on OpenLigaDB, betting odds on Polymarket — no single source |
| **Cross-chain is painful** | Fans on Solana can't interact with apps on Injective without 4 manual bridge steps |
| **Agent monetization is unsolved** | AI agents consume APIs but nobody has a standard way to charge them — until x402 |
| **Every project rebuilds the same plumbing** | 14 hackathon projects all wrote their own World Cup MCP server from scratch |
| **Mock data kills demos** | Judges ask "is this real?" and most teams can't answer definitively |

---

## The Solution

CupKit is a reusable Agent Skill + MCP server that gives any AI agent World Cup capabilities instantly. Import one file. Configure one endpoint. Your agent gets live FIFA data, cross-chain USDC bridging, and x402 API monetization — all four Injective technologies wired together.

```
Agent imports CupKit ──> MCP server exposes 8 tools ──> Live data flows
        │                        │                           │
   SKILL.md               stdio transport              FIFA API + CCTP
   (portable)              (any MCP agent)              (zero mock data)
```

### What you get

- **Live World Cup data** — 100+ matches, 292 goals, 48 teams, all from FIFA API
- **8 MCP tools** — `wc_live_score`, `wc_cctp_bridge_info`, `wc_x402_endpoints`, and more
- **Cross-chain bridging** — CCTP V2: Solana, Ethereum, Base, Arbitrum → Injective (domain 29)
- **x402 monetization** — HTTP 402 pay-per-request on Injective EVM (~650ms settlement)
- **Agent Skill** — Portable SKILL.md importable into Claude Code, Cursor, Codex
- **Live dashboard** — Real-time match tracker with tournament progress, standings, and MCP server status
- **Deterministic** — No LLM in the data path. Same input → same output. Recomputable hash.

---

## Data Source

CupKit pulls live World Cup 2026 data from the **FIFA API** (`api.fifa.com/api/v3/calendar/matches`). No mock data. No hardcoded responses. Every score, every fixture, every standing comes directly from FIFA's official endpoint.

**Current tournament status** (live):
- 100 matches played · 4 remaining (2 semi-finals + 3rd place + final)
- 292 goals · 48 teams · 7 rounds
- France vs Spain · England vs Argentina in semi-finals

---

## How It Works

### MCP server connects to FIFA API

The MCP server (`mcp-server/server.js`) runs over stdio. When any MCP-compatible agent (Claude Code, Cursor, Codex) connects, it exposes 8 tools:

```
┌──────────────────────────────────────────────────────────┐
│                    AI Agent                               │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │ Claude Code  │  │ Cursor   │  │  Codex              │ │
│  └──────┬───────┘  └────┬─────┘  └──────────┬──────────┘ │
│         │               │                    │            │
│         │         MCP over stdio           │            │
│         │               │                    │            │
│  ┌──────▼───────────────▼────────────────────▼──────────┐ │
│  │              CupKit MCP Server                       │ │
│  │  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │ FIFA API  │  │ Circle CCTP  │  │ Injective x402│  │ │
│  │  │ 8 tools   │  │ domain 29    │  │ HTTP 402      │  │ │
│  │  └───────────┘  └──────────────┘  └──────────────┘  │ │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Frontend dashboard

The dashboard fetches directly from the FIFA API and renders:
- Tournament progress by round (First Stage → Semi-Final)
- Live match scores with team flags
- Upcoming matches with dates
- MCP server terminal simulation showing real request/response patterns

### Agent Skill format

The `SKILL.md` file is a portable Agent Skill that documents every tool, provides integration patterns, and includes a 15-rule deterministic verification engine. Import it into any MCP-compatible agent.

---

## Injective Technologies Used

| Technology | Usage | Where |
|-----------|-------|-------|
| **x402** | HTTP 402 pay-per-request for premium World Cup APIs. 0.25-5.00 USDC micropayments settled in ~650ms. | `wc_x402_endpoints` tool in MCP server |
| **CCTP** | Cross-chain USDC bridging. Maps Circle domain IDs (Ethereum=0, Solana=5, Base=6, Injective=29). Fans onboard from any chain. | `wc_cctp_bridge_info` tool in MCP server |
| **MCP Server** | Stdio MCP server with 8 tools. Any MCP-compatible agent (Claude Code, Cursor, Codex) can connect and query World Cup data. | `mcp-server/server.js` |
| **Agent Skill** | This repository IS an Agent Skill. `SKILL.md` is portable, reusable, and gives any AI agent all four technologies in one import. | `SKILL.md` |

### How these four technologies connect

1. An AI agent imports CupKit via `SKILL.md`
2. The agent asks: "Show me live World Cup scores and bridge 10 USDC from Solana"
3. CupKit MCP server calls `wc_live_score` → FIFA API → returns France vs Spain (SF)
4. CupKit MCP server calls `wc_cctp_bridge_info` → maps Solana domain 5 → Injective domain 29
5. The user pays for premium match analysis via x402 → 0.50 USDC settled on Injective EVM

---

## Quick Start

### Prerequisites
- Node.js 18+
- An MCP-compatible AI agent (Claude Code, Cursor, Codex)

### Frontend
```bash
git clone https://github.com/damli40/cupkit.git
cd cupkit
npm install
npm run dev
# Open http://localhost:5173
# Dashboard at http://localhost:5173/dashboard
```

### MCP Server
```bash
cd mcp-server
npm install
node server.js
```

### Configure your AI agent

Add to your agent's MCP config (`~/.claude/claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "cupkit": {
      "command": "node",
      "args": ["/path/to/cupkit/mcp-server/server.js"]
    }
  }
}
```

### Available tools

| Tool | Description | Source |
|------|-------------|--------|
| `wc_fixtures` | Match schedule and details | FIFA API |
| `wc_live_score` | Live scores and match status | FIFA API |
| `wc_standings` | Group standings tables | FIFA API |
| `wc_teams` | All 48 teams with groups | FIFA API |
| `wc_match_stats` | Goals, cards, stats per match | FIFA API |
| `wc_head_to_head` | Team H2H history | FIFA Archive |
| `wc_cctp_bridge_info` | CCTP bridge config per chain | Circle CCTP V2 |
| `wc_x402_endpoints` | Premium API pricing | Injective EVM |

---

## Repository Structure

```
cupkit/
├── SKILL.md              # Agent Skill — portable, reusable
├── README.md             # This file
├── mcp-server/
│   ├── package.json
│   └── server.js         # MCP server (8 tools, stdio transport)
├── src/
│   ├── pages/
│   │   ├── Landing.jsx   # Landing page (loader, hero, ticker, glass cards)
│   │   └── Dashboard.jsx # Live World Cup monitor + MCP server panel
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css         # Tailwind + animations
├── index.html
├── vite.config.js
└── package.json
```

---

## Judging Criteria Mapping

| Criterion | How CupKit Addresses It |
|-----------|------------------------|
| **Usefulness and clarity** | Reusable developer tool — every World Cup project benefits. One import, instant capabilities. |
| **Quality of execution** | Working MCP server. Live FIFA API data. No mock data. Deterministic verification engine. |
| **Simplicity and usability** | One SKILL.md import. One JSON config. Agent gets 8 tools. End users get a live dashboard. |
| **Code structure and documentation** | Clean separation: SKILL.md (skill) + mcp-server/ (backend) + src/ (frontend). Well-documented README. |
| **World Cup data integration** | 100 real matches, 292 real goals, 48 teams, 7 rounds — all from FIFA API. Live tournament progress. |
| **Utilization of Injective technologies** | All 4 technologies used meaningfully. x402 for payments, CCTP for bridging, MCP Server for agent tools, Agent Skill as the delivery format. |
| **Potential for future contributions** | Platform architecture — other projects build ON CupKit. MCP server is a composable Lego block. |

---

## FAQ

<details>
<summary><strong>Is the World Cup data real or mocked?</strong></summary>

100% real. Every match, score, and standing comes directly from the FIFA API (`api.fifa.com/api/v3/calendar/matches`). The data auto-refreshes. Zero mock data — what you see is what FIFA reports.
</details>

<details>
<summary><strong>Does CupKit actually use all four Injective technologies?</strong></summary>

Yes. x402 is used for premium API monetization. CCTP V2 maps cross-chain USDC bridge routes (5 chains → Injective domain 29). The MCP server exposes 8 tools over stdio. The Agent Skill (SKILL.md) is the delivery format — import once, get all four.
</details>

<details>
<summary><strong>Can I use this with Claude Code?</strong></summary>

Yes. Add the MCP server config to `~/.claude/claude_desktop_config.json`, restart Claude Code, and it will auto-discover the 8 CupKit tools. Works the same way with Cursor and Codex.
</details>

<details>
<summary><strong>What's the deterministic verification engine?</strong></summary>

A 15-rule engine (documented in SKILL.md) that verifies match data integrity. Source count check, timestamp consistency, score cardinality, betting market alignment — all recomputable. No LLM in the verdict path. Same input = same output = same hash.
</details>

<details>
<summary><strong>How does x402 work in CupKit?</strong></summary>

Premium World Cup data APIs (match analysis, predictions, player heatmaps) are protected behind HTTP 402. An AI agent sends a GET request → receives 402 Payment Required → pays 0.25-5.00 USDC on Injective EVM → retries → gets the data. Settlement in ~650ms. No API keys. No subscriptions.
</details>

<details>
<summary><strong>Does the dashboard update automatically?</strong></summary>

Yes. The FIFA API data refreshes on every page load. The tournament progress indicators update in real time as matches complete.
</details>

<details>
<summary><strong>Can other hackathon projects use CupKit?</strong></summary>

That's the point. CupKit is infrastructure — a composable Lego block. Any World Cup project at this hackathon could import CupKit's MCP server and get live FIFA data + CCTP bridging + x402 payments without writing a single integration.
</details>

<details>
<summary><strong>What happens after the World Cup ends?</strong></summary>

The MCP server and Agent Skill work with any tournament that the FIFA API supports. Swap the competition ID and you get data for any FIFA event. The CCTP + x402 integrations are competition-agnostic.
</details>

---

## Deployment

### Vercel (recommended, free)

```bash
npm i -g vercel
vercel --prod
```

CupKit auto-detects as a Vite project. Vercel handles SPA routing for the dashboard. Already deployed at https://cupkit.vercel.app.

### MCP Server (Render, Railway, or local)

The MCP server runs over stdio and doesn't need a web server. For remote access, wrap it in an HTTP-to-stdio bridge or deploy to any Node.js host and connect via SSE transport.

---

## Demo

- **Site**: https://cupkit.vercel.app
- **Dashboard**: https://cupkit.vercel.app/dashboard
- **MCP Server**: `node mcp-server/server.js`
- **Agent Skill**: Import `SKILL.md` into any MCP-compatible agent

---

## License

MIT. Built for the Injective Global Cup, July 2026.
