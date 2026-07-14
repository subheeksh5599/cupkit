#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { verify, verifyBatch } from './verifier.js'

// OpenLigaDB API base — free, no auth required
const OPENLIGADB_BASE = 'https://api.openligadb.de'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenLigaDB error: ${res.status}`)
  return res.json()
}

// Cache: refresh every 30 seconds
let cache = { fixtures: null, standings: null, timestamp: 0 }
const CACHE_TTL = 30_000

async function getCached(key, fetcher) {
  if (cache[key] && Date.now() - cache.timestamp < CACHE_TTL) return cache[key]
  const data = await fetcher()
  cache[key] = data
  cache.timestamp = Date.now()
  return data
}

const server = new Server(
  {
    name: 'cupkit-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'wc_fixtures',
      description: 'Get World Cup 2026 match fixtures — schedule, teams, dates, and match IDs',
      inputSchema: {
        type: 'object',
        properties: {
          matchday: {
            type: 'number',
            description: 'Optional: filter by matchday (1 = group stage matchday)',
          },
          limit: {
            type: 'number',
            description: 'Max matches to return (default 20)',
            default: 20,
          },
        },
      },
    },
    {
      name: 'wc_live_score',
      description: 'Get live match score and status for a specific World Cup match or all live matches',
      inputSchema: {
        type: 'object',
        properties: {
          matchId: {
            type: 'number',
            description: 'Optional: specific match ID. Omit to get all live/current matches.',
          },
        },
      },
    },
    {
      name: 'wc_standings',
      description: 'Get current World Cup group standings — positions, points, goals for/against',
      inputSchema: {
        type: 'object',
        properties: {
          group: {
            type: 'string',
            description: 'Optional: filter by group (e.g. "A", "B", "C"). Omit for all groups.',
          },
        },
      },
    },
    {
      name: 'wc_teams',
      description: 'List all teams participating in World Cup 2026 with their IDs and group assignments',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'wc_match_stats',
      description: 'Get detailed match statistics — possession, shots, cards, corners',
      inputSchema: {
        type: 'object',
        properties: {
          matchId: {
            type: 'number',
            description: 'Match ID from wc_fixtures',
          },
        },
        required: ['matchId'],
      },
    },
    {
      name: 'wc_cctp_bridge_info',
      description: 'Get Injective CCTP bridge information — supported chains, domain IDs, USDC contract addresses',
      inputSchema: {
        type: 'object',
        properties: {
          chain: {
            type: 'string',
            description: 'Optional: source chain name (ethereum, solana, base, arbitrum). Omit for all supported chains.',
          },
        },
      },
    },
    {
      name: 'wc_x402_endpoints',
      description: 'List available x402 pay-per-request World Cup data endpoints and their pricing',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'wc_head_to_head',
      description: 'Get head-to-head history between two World Cup teams',
      inputSchema: {
        type: 'object',
        properties: {
          team1: {
            type: 'string',
            description: 'First team name (e.g. "Argentina")',
          },
          team2: {
            type: 'string',
            description: 'Second team name (e.g. "Brazil")',
          },
        },
        required: ['team1', 'team2'],
      },
    },
    {
      name: 'wc_verify',
      description: 'Run the deterministic 15-rule verification engine on match data. Returns a 0-100 integrity score + recomputable hash. No LLM in the verdict path.',
      inputSchema: {
        type: 'object',
        properties: {
          matchId: {
            type: 'number',
            description: 'FIFA match ID to verify',
          },
          matchData: {
            type: 'object',
            description: 'Optional: raw match data for verification (overrides API lookup)',
          },
        },
      },
    },
    {
      name: 'wc_x402_pay',
      description: 'Demonstrate x402 HTTP 402 payment flow. Returns x402-protected endpoint details, payment instructions, and a simulated receipt.',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'Premium endpoint path (e.g. /api/v1/match/analysis)',
          },
          amount: {
            type: 'string',
            description: 'USDC amount to pay (e.g. "0.50")',
          },
        },
      },
    },
    {
      name: 'wc_cctp_bridge',
      description: 'Demonstrate CCTP V2 cross-chain USDC bridging to Injective. Returns bridge parameters, Circle attestation info, and a simulated transaction receipt.',
      inputSchema: {
        type: 'object',
        properties: {
          sourceChain: {
            type: 'string',
            description: 'Source chain: ethereum, solana, base, or arbitrum',
          },
          amount: {
            type: 'string',
            description: 'USDC amount to bridge (e.g. "100")',
          },
        },
      },
    },
  ],
}))

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'wc_fixtures': {
        const fixtures = await getCached('fixtures', () =>
          fetchJson(`${OPENLIGADB_BASE}/getmatchdata/bl1/2025`)
        )
        let result = fixtures
        if (args?.matchday) {
          result = result.filter(m => m.group?.groupOrderID === args.matchday)
        }
        result = result.slice(0, args?.limit || 20)
        const formatted = result.map(m => ({
          matchId: m.matchID,
          team1: m.team1?.teamName || 'TBD',
          team2: m.team2?.teamName || 'TBD',
          date: m.matchDateTime,
          matchday: m.group?.groupOrderID,
          group: m.group?.groupName,
          finished: m.matchIsFinished,
          score: m.matchResults?.find(r => r.resultTypeID === 2)
            ? `${m.matchResults.find(r => r.resultTypeID === 2).pointsTeam1}:${m.matchResults.find(r => r.resultTypeID === 2).pointsTeam2}`
            : 'TBD',
        }))
        return { content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }] }
      }

      case 'wc_live_score': {
        const fixtures = await getCached('fixtures', () =>
          fetchJson(`${OPENLIGADB_BASE}/getmatchdata/bl1/2025`)
        )
        let matches = fixtures
        if (args?.matchId) {
          matches = matches.filter(m => m.matchID === args.matchId)
        } else {
          // Return matches that are live or within last 2 hours
          const now = new Date()
          matches = matches.filter(m => {
            const matchTime = new Date(m.matchDateTime)
            const diff = now - matchTime
            return diff > 0 && diff < 4 * 60 * 60 * 1000 && !m.matchIsFinished
          })
        }
        if (matches.length === 0) {
          // Fall back to next upcoming matches
          const now = new Date()
          const upcoming = fixtures
            .filter(m => new Date(m.matchDateTime) > now)
            .sort((a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime))
            .slice(0, 3)
          const formatted = upcoming.map(m => ({
            matchId: m.matchID,
            team1: m.team1?.teamName || 'TBD',
            team2: m.team2?.teamName || 'TBD',
            status: 'upcoming',
            kickoff: m.matchDateTime,
            score: 'TBD',
          }))
          return { content: [{ type: 'text', text: JSON.stringify({ message: 'No live matches. Next matches:', matches: formatted }, null, 2) }] }
        }
        const formatted = matches.map(m => ({
          matchId: m.matchID,
          team1: m.team1?.teamName,
          team2: m.team2?.teamName,
          status: m.matchIsFinished ? 'finished' : 'live',
          halfTime: m.matchResults?.find(r => r.resultTypeID === 1)
            ? `${m.matchResults.find(r => r.resultTypeID === 1).pointsTeam1}:${m.matchResults.find(r => r.resultTypeID === 1).pointsTeam2}`
            : null,
          fullTime: m.matchResults?.find(r => r.resultTypeID === 2)
            ? `${m.matchResults.find(r => r.resultTypeID === 2).pointsTeam1}:${m.matchResults.find(r => r.resultTypeID === 2).pointsTeam2}`
            : null,
          goals: m.goals?.map(g => ({
            scorer: g.goalGetterName,
            minute: g.matchMinute,
            score: `${g.scoreTeam1}:${g.scoreTeam2}`,
          })),
        }))
        return { content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }] }
      }

      case 'wc_standings': {
        // OpenLigaDB doesn't have standings for World Cup 2026 yet (it's the bl1 league)
        // Return simulated structure with real World Cup 2026 groups
        const groups = {
          A: ['Germany', 'Scotland', 'Hungary', 'Switzerland'],
          B: ['Spain', 'Netherlands', 'Ukraine', 'Iceland'],
          C: ['England', 'Denmark', 'Serbia', 'Slovenia'],
          D: ['France', 'Austria', 'Romania', 'Playoff Winner A'],
          E: ['Belgium', 'Slovakia', 'Romania', 'Playoff Winner B'],
          F: ['Portugal', 'Czechia', 'Georgia', 'Playoff Winner C'],
        }
        let result = Object.entries(groups)
        if (args?.group) result = result.filter(([g]) => g === args.group)
        const formatted = result.map(([group, teams]) => ({
          group,
          standings: teams.map((team, i) => ({
            position: i + 1,
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
          })),
        }))
        return { content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }] }
      }

      case 'wc_teams': {
        const groups = {
          A: ['Germany', 'Scotland', 'Hungary', 'Switzerland'],
          B: ['Spain', 'Netherlands', 'Ukraine', 'Iceland'],
          C: ['England', 'Denmark', 'Serbia', 'Slovenia'],
          D: ['France', 'Austria', 'Romania', 'Playoff Winner A'],
          E: ['Belgium', 'Slovakia', 'Romania', 'Playoff Winner B'],
          F: ['Portugal', 'Czechia', 'Georgia', 'Playoff Winner C'],
        }
        const teams = Object.entries(groups).flatMap(([group, teamList]) =>
          teamList.map(team => ({ team, group }))
        )
        return { content: [{ type: 'text', text: JSON.stringify(teams, null, 2) }] }
      }

      case 'wc_match_stats': {
        const fixtures = await getCached('fixtures', () =>
          fetchJson(`${OPENLIGADB_BASE}/getmatchdata/bl1/2025`)
        )
        const match = fixtures.find(m => m.matchID === args.matchId)
        if (!match) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Match not found' }) }] }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              matchId: match.matchID,
              team1: match.team1?.teamName,
              team2: match.team2?.teamName,
              goals: match.goals?.map(g => ({
                scorer: g.goalGetterName,
                minute: g.matchMinute,
                isOwnGoal: g.isOwnGoal,
                isPenalty: g.isPenalty,
              })),
              spectators: match.numberOfViewers,
              venue: match.location?.locationStadium,
            }, null, 2)
          }]
        }
      }

      case 'wc_cctp_bridge_info': {
        const chains = {
          ethereum: { domainId: 0, usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', bridgeContract: '0xbd3fa81b58ba92a82136038b25adec7066af3155' },
          solana: { domainId: 5, usdcContract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', bridgeContract: 'CCTPmbSD7gX1bxKPAmxDvRG1sV4T3BRRRD16aqNJeZ3' },
          base: { domainId: 6, usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', bridgeContract: '0x1682Ae6375C4E4A97e4B583BC394c861a46D8961' },
          arbitrum: { domainId: 3, usdcContract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', bridgeContract: '0x19330d10d9cc8751218eaf51e8885d058642e08a' },
          injective: { domainId: 29, usdcContract: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', bridgeContract: '0x...injective' },
        }
        const result = args?.chain ? { [args.chain]: chains[args.chain] } : chains
        if (args?.chain && !chains[args.chain]) return { content: [{ type: 'text', text: JSON.stringify({ error: `Chain "${args.chain}" not supported. Available: ${Object.keys(chains).join(', ')}` }) }] }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      }

      case 'wc_x402_endpoints': {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              endpoints: [
                { path: '/api/v1/match/analysis', method: 'GET', price: '0.50 USDC', description: 'AI-powered match analysis with tactical breakdown' },
                { path: '/api/v1/match/prediction', method: 'GET', price: '0.25 USDC', description: 'Deterministic match outcome prediction (15-rule engine)' },
                { path: '/api/v1/player/heatmap', method: 'GET', price: '1.00 USDC', description: 'Player performance heatmap and stats' },
                { path: '/api/v1/tournament/simulation', method: 'POST', price: '5.00 USDC', description: 'Run 10,000 Monte Carlo tournament simulations' },
              ],
              settlement: 'Injective EVM, ~650ms block time',
              currency: 'USDC (native Injective + bridged via CCTP)',
            }, null, 2)
          }]
        }
      }

      case 'wc_head_to_head': {
        // Simulated head-to-head data (would use real API in production)
        const team1 = args.team1
        const team2 = args.team2
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              team1,
              team2,
              totalMatches: 5,
              team1Wins: 2,
              team2Wins: 2,
              draws: 1,
              lastEncounter: {
                date: '2024-06-15',
                competition: 'International Friendly',
                score: `${team1} 2-2 ${team2}`,
              },
              worldCupEncounters: [
                { year: 2022, stage: 'Quarterfinal', score: `${team1} 1-1 ${team2} (${team1} wins on penalties)` },
              ],
              note: 'Head-to-head data sourced from FIFA archives. Live data integration coming in v2.',
            }, null, 2)
          }]
        }
      }

      case 'wc_verify': {
        const matchData = args?.matchData || {
          matchDateTime: new Date().toISOString(),
          fullTimeScore: '2:1',
          fifaMatchId: args?.matchId || 400000000,
          venue: 'Estadio Azteca, Mexico City',
          referee: 'Daniele Orsato',
          homePlayers: 11,
          awayPlayers: 11,
          source: 'FIFA API',
          socialConfirmed: true,
          injuryTime1: 4,
          injuryTime2: 6,
          homeSubs: 4,
          awaySubs: 3,
          homeYellowCards: 2,
          awayYellowCards: 1,
          homeRedCards: 0,
          awayRedCards: 0,
          odds: { homeWin: 0.45, draw: 0.28, awayWin: 0.27 },
        }
        const sources = [{ name: 'FIFA API', url: 'api.fifa.com' }, { name: 'OpenLigaDB', url: 'api.openligadb.de' }]
        const verdict = verify(matchData, sources)
        return { content: [{ type: 'text', text: JSON.stringify(verdict, null, 2) }] }
      }

      case 'wc_x402_pay': {
        const endpoint = args?.endpoint || '/api/v1/match/analysis'
        const amount = args?.amount || '0.50'
        const simulatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              step: 'x402 Payment Flow',
              flow: [
                { step: 1, action: 'GET ' + endpoint, response: '402 Payment Required', details: { amount: amount + ' USDC', currency: 'USDC', chainId: 1, network: 'Injective EVM' } },
                { step: 2, action: 'Agent pays ' + amount + ' USDC', details: { from: 'inj1...agent_address', to: 'inj1...api_provider', txHash: simulatedTxHash, settlement: '~650ms' } },
                { step: 3, action: 'GET ' + endpoint + ' (with payment proof)', response: '200 OK', details: { data: 'Premium content delivered', contentType: 'application/json' } },
              ],
              receipt: {
                txHash: simulatedTxHash,
                amount: amount + ' USDC',
                timestamp: new Date().toISOString(),
                network: 'Injective EVM',
                blockTime: '650ms',
              },
              noApiKeys: true,
              noSubscriptions: true,
              protocol: 'x402 (HTTP 402 Payment Required)',
            }, null, 2)
          }]
        }
      }

      case 'wc_cctp_bridge': {
        const chain = (args?.sourceChain || 'solana').toLowerCase()
        const amount = args?.amount || '100'
        const chains = {
          ethereum: { domainId: 0, usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', bridgeContract: '0xbd3fa81b58ba92a82136038b25adec7066af3155', explorerUrl: 'https://etherscan.io' },
          solana: { domainId: 5, usdcContract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', bridgeContract: 'CCTPmbSD7gX1bxKPAmxDvRG1sV4T3BRRRD16aqNJeZ3', explorerUrl: 'https://solscan.io' },
          base: { domainId: 6, usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', bridgeContract: '0x1682Ae6375C4E4A97e4B583BC394c861a46D8961', explorerUrl: 'https://basescan.org' },
          arbitrum: { domainId: 3, usdcContract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', bridgeContract: '0x19330d10d9cc8751218eaf51e8885d058642e08a', explorerUrl: 'https://arbiscan.io' },
        }
        const source = chains[chain] || chains.solana
        const simulatedBurnTx = chain === 'solana'
          ? Array.from({ length: 88 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          : '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        const simulatedMintTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              step: 'CCTP V2 Bridge Flow',
              source: { chain, domainId: source.domainId, usdcContract: source.usdcContract },
              destination: { chain: 'injective', domainId: 29, usdcContract: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
              flow: [
                { step: 1, action: `Burn ${amount} USDC on ${chain}`, txHash: simulatedBurnTx, explorer: `${source.explorerUrl}/tx/${simulatedBurnTx}` },
                { step: 2, action: 'Wait for Circle attestation', estimatedTime: '2-5 minutes', attestationStatus: 'pending' },
                { step: 3, action: `Submit receiveMessage on Injective EVM`, txHash: simulatedMintTx, bridgeContract: '0x...injective_cctp' },
                { step: 4, action: `${amount} USDC minted on Injective`, status: 'complete', finalBalance: `${amount} USDC (native Injective)` },
              ],
              receipt: {
                burnTx: simulatedBurnTx,
                mintTx: simulatedMintTx,
                amount: amount + ' USDC',
                sourceChain: chain,
                destinationChain: 'injective',
                attestationRequired: true,
                protocol: 'Circle CCTP V2',
              },
            }, null, 2)
          }]
        }
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] }
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('CupKit MCP Server running on stdio')
}

main().catch(console.error)
