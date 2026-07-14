---
name: cupkit
description: World Cup Agent Development Kit — query live World Cup data, bridge USDC cross-chain via CCTP, monetize APIs with x402, all through Injective. Give any AI agent World Cup capabilities in one import.
version: 1.0.0
tags: [world-cup, injective, x402, cctp, mcp, agent-skill, sports]
---

# CupKit — World Cup Agent Development Kit

One Agent Skill. Four Injective technologies. Give any AI agent the power to query live World Cup data, bridge USDC cross-chain via CCTP, and monetize APIs with x402 — all through the Injective network.

Built for The Injective Global Cup, July 2026.

## What This Skill Gives Your Agent

| Capability | Technology | What It Does |
|-----------|-----------|--------------|
| **Live World Cup Data** | MCP Server | Fixtures, live scores, standings, match stats, head-to-head |
| **Cross-Chain USDC** | CCTP | Bridge USDC from Ethereum, Solana, Base, Arbitrum into Injective — with simulated transaction flow |
| **Pay-Per-Request** | x402 | Monetize World Cup data APIs with HTTP 402 micropayments — with simulated payment flow |
| **Verification Engine** | Deterministic | 15-rule engine, no LLM in verdict path, recomputable hash — runs as `wc_verify` tool |
| **Agent Integration** | Agent Skill | This file. Import once, get all four technologies. |

## Prerequisites

- Node.js 18+
- An Injective wallet (for x402 payments and CCTP bridging)
- Access to an MCP-compatible AI agent (Claude Code, Cursor, Codex)

## Quick Start

### 1. Install CupKit MCP Server

```bash
git clone https://github.com/damli40/cupkit
cd cupkit/mcp-server
npm install
```

### 2. Configure Your AI Agent

Add this to your agent's MCP server config:

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

### 3. Start Using World Cup Tools

Your agent now has these tools:

```
wc_fixtures        — World Cup match schedule
wc_live_score      — Live match scores
wc_standings       — Group standings
wc_teams           — All participating teams
wc_match_stats     — Detailed match statistics
wc_cctp_bridge_info — CCTP bridge configuration
wc_x402_endpoints  — Premium API pricing
wc_head_to_head    — Team head-to-head history
wc_verify          — 15-rule deterministic verification (score 0-100)
wc_x402_pay        — x402 payment flow demo (HTTP 402 → USDC → receipt)
wc_cctp_bridge     — CCTP V2 bridge flow demo (burn → attest → mint)
```

## Tool Reference

### `wc_fixtures`
Get World Cup 2026 match fixtures.

```
Parameters:
  matchday (number, optional) — Filter by matchday
  limit (number, optional)    — Max matches (default 20)

Example: "Show me all World Cup quarterfinal matches"
→ wc_fixtures(matchday: 5, limit: 4)
```

### `wc_live_score`
Get live match scores.

```
Parameters:
  matchId (number, optional) — Specific match. Omit for all live matches.

Example: "What's the score in Argentina vs Brazil?"
→ wc_live_score(matchId: 12345)
```

### `wc_standings`
Get group standings.

```
Parameters:
  group (string, optional) — Filter by group letter

Example: "Show Group C standings"
→ wc_standings(group: "C")
```

### `wc_cctp_bridge_info`
Get CCTP bridge info for cross-chain USDC transfers.

```
Parameters:
  chain (string, optional) — Source chain name

Example: "How do I bridge USDC from Solana to Injective?"
→ wc_cctp_bridge_info(chain: "solana")
```

### `wc_x402_endpoints`
List premium x402 API endpoints and pricing.

```
Example: "What premium World Cup data can I buy?"
→ wc_x402_endpoints()
```

## x402 Integration Pattern

Protect your World Cup data API with x402:

```javascript
// Your API endpoint
app.get('/api/v1/match/analysis/:matchId', async (req, res) => {
  // x402: Require 0.50 USDC payment
  const paymentVerified = await verifyX402Payment(req, {
    amount: '0.50',
    currency: 'USDC',
    chainId: 1, // Injective
  })

  if (!paymentVerified) {
    return res.status(402).json({
      error: 'Payment Required',
      amount: '0.50 USDC',
      paymentAddress: 'inj1...', // Your Injective address
      chainId: 1,
    })
  }

  // Serve the premium content
  const analysis = await getMatchAnalysis(req.params.matchId)
  res.json(analysis)
})
```

## CCTP Bridge Pattern

Bridge USDC from any chain into Injective:

```javascript
import { cupkit } from '@cupkit/skill'

// Bridge 10 USDC from Solana to Injective
const bridgeInfo = await cupkit.wc_cctp_bridge_info({ chain: 'solana' })
// Returns: { domainId: 5, usdcContract: 'EPjFW...', bridgeContract: 'CCTPmb...' }

// Initiate bridge transaction on Solana
const tx = await burnUsdcOnSolana({
  amount: 10,
  destinationDomain: 29, // Injective domain ID
  destinationAddress: 'inj1...your_injective_address',
})

// Wait for Circle attestation (~2-5 minutes)
const attestation = await waitForAttestation(tx.signature)

// Mint on Injective side
const injectiveTx = await mintOnInjective({
  message: tx.message,
  attestation,
})
```

## Deterministic Verification Engine

CupKit includes a 15-rule deterministic engine for verifying match data integrity. No LLM in the verification path — same input produces same output, recomputable on any machine.

```
Rules:
  1. Source count check (≥2 independent sources)
  2. Timestamp consistency (±30s tolerance)
  3. Score cardinality (scores must be monotonic)
  4. Player count (11 per side, plus subs)
  5. Venue confirmation
  6. Referee assignment
  7. Weather data correlation
  8. Betting market alignment (±5% tolerance)
  9. Social media signal cross-check
  10. Video timestamp watermark match
  11. Official FIFA feed correlation
  12. Injury time consistency
  13. Substitution count limits (5 per side)
  14. Card accumulation tracking
  15. Offside call verification
```

Score: 0-100. ≥85 = verified. <60 = flagged for review.

## Injective Technologies Used

| Technology | Usage | File |
|-----------|-------|------|
| x402 | Premium API monetization, HTTP 402 payments | `mcp-server/server.js` (wc_x402_endpoints) |
| CCTP | Cross-chain USDC bridging info, domain mapping | `mcp-server/server.js` (wc_cctp_bridge_info) |
| MCP Server | Stdio MCP server with 8 World Cup tools | `mcp-server/server.js` |
| Agent Skill | This file — reusable skill for AI agents | `SKILL.md` |

## Repository Structure

```
cupkit/
├── SKILL.md              # This file — Agent Skill definition
├── mcp-server/
│   ├── package.json
│   └── server.js         # MCP server (8 World Cup tools)
├── src/                  # Frontend (Vite + React)
│   ├── pages/
│   │   ├── Landing.jsx   # Landing page
│   │   └── Dashboard.jsx # Linear-style issue tracker
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Demo

- Landing page: `cupkit.vercel.app`
- Dashboard: `cupkit.vercel.app/dashboard`
- MCP Server: Clone repo, run `node mcp-server/server.js`
- Agent Skill: Import this SKILL.md into Claude Code or Cursor

## License

MIT — Built for The Injective Global Cup, July 2026.
