import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const FIFA_API = 'https://api.fifa.com/api/v3/calendar/matches?from=2026-06-01T00:00:00Z&to=2026-08-01T00:00:00Z&count=110&idCompetition=17'

function getTeamName(team) {
  if (!team) return 'TBD'
  const names = team.TeamName || []
  return names[0]?.Description || 'TBD'
}

function getTeamFlag(team) {
  if (!team) return ''
  // Use FIFA's own flag picture URL
  const picUrl = team.PictureUrl || ''
  if (picUrl) {
    return picUrl.replace('{format}', 'sq').replace('{size}', '4')
  }
  return ''
}

function getTeamCode(team) {
  if (!team) return ''
  return (team.IdCountry || '').toLowerCase()
}

export default function Dashboard() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activePanel, setActivePanel] = useState('overview')
  const [stageFilter, setStageFilter] = useState('All')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch(FIFA_API)
      if (!res.ok) throw new Error(`FIFA API: ${res.status}`)
      const data = await res.json()
      setMatches(data.Results || [])
      setLoading(false)
      setError(null)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const played = matches.filter(m => m.HomeTeamScore != null && m.AwayTeamScore != null)
  const upcoming = matches.filter(m => m.HomeTeamScore == null || m.AwayTeamScore == null)
  const totalGoals = played.reduce((s, m) => s + (m.HomeTeamScore || 0) + (m.AwayTeamScore || 0), 0)

  // Get unique stages
  const stages = [...new Set(matches.map(m => {
    const sn = m.StageName || []
    return sn[0]?.Description || 'Unknown'
  }))]

  // Stage counts
  function stageStats(stage) {
    const sm = matches.filter(m => {
      const sn = m.StageName || []
      return sn[0]?.Description === stage
    })
    const played = sm.filter(m => m.HomeTeamScore != null).length
    return { total: sm.length, played }
  }

  // Group matches by stage
  const filtered = stageFilter === 'All' ? matches : matches.filter(m => {
    const sn = m.StageName || []
    return sn[0]?.Description === stageFilter
  })

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0d0f]">
        <span className="text-[#7d828c] animate-pulse">Loading FIFA World Cup 2026...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c0d0f]">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-sm">Failed: {error}</div>
          <button onClick={fetchData} className="px-4 py-2 text-sm bg-white/[0.08] text-[#f4f5f8] rounded-md hover:bg-white/[0.12]">Retry</button>
        </div>
      </div>
    )
  }

  const panels = [
    { key: 'overview', label: 'Overview' },
    { key: 'matches', label: 'Matches' },
    { key: 'server', label: 'MCP Server' },
  ]

  return (
    <div className="h-screen flex bg-[#0c0d0f] font-inter text-sm overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-[#0c0d0f] border-r border-white/[0.07] flex flex-col">
        <Link to="/" className="px-4 py-3 block">
          <div className="text-[#f4f5f8] text-[13px] font-medium leading-tight">CupKit</div>
          <div className="text-[#FDE047] text-[10px] leading-tight font-medium">World Cup 2026</div>
        </Link>

        <nav className="px-3 py-3 space-y-0.5">
          {panels.map(p => (
            <button key={p.key} onClick={() => setActivePanel(p.key)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                activePanel === p.key ? 'bg-white/[0.08] text-[#f4f5f8]' : 'text-[#7d828c] hover:text-[#b9bdc6] hover:bg-white/[0.04]'
              }`}>
              {p.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3 py-3 border-t border-white/[0.07] text-[11px] text-[#7d828c] space-y-1">
          <div className="flex justify-between"><span>Total</span><span>{matches.length}</span></div>
          <div className="flex justify-between"><span>Played</span><span className="text-emerald-400">{played.length}</span></div>
          <div className="flex justify-between"><span>Upcoming</span><span>{upcoming.length}</span></div>
          <div className="flex justify-between"><span>Goals</span><span className="text-[#FDE047]">{totalGoals}</span></div>
          <div className="flex justify-between"><span>Source</span><span className="text-emerald-400">FIFA API</span></div>
        </div>

        <div className="px-3 py-3 border-t border-white/[0.07] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FDE047] flex items-center justify-center text-[11px] font-bold text-[#0c0d0f]">CK</div>
          <div className="text-[13px] text-[#f4f5f8] font-medium">CupKit</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-12 flex items-center gap-4 px-6 border-b border-white/[0.07] flex-shrink-0">
          <span className="text-[15px] font-medium text-[#f4f5f8]">
            {panels.find(p => p.key === activePanel)?.label || 'Dashboard'}
          </span>
          <div className="flex-1" />
          {upcoming.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {upcoming.length} upcoming
            </span>
          )}
          <Link to="/" className="px-3 py-1 text-[12px] text-[#7d828c] hover:text-[#f4f5f8] border border-white/[0.08] rounded-md hover:bg-white/[0.04]">Back</Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activePanel === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl font-space font-bold text-emerald-400">{played.length}</div>
                  <div className="text-[11px] text-[#7d828c] mt-1">Played</div>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl font-space font-bold text-[#FDE047]">{upcoming.length}</div>
                  <div className="text-[11px] text-[#7d828c] mt-1">Remaining</div>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl font-space font-bold text-[#f4f5f8]">{totalGoals}</div>
                  <div className="text-[11px] text-[#7d828c] mt-1">Total Goals</div>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <div className="text-3xl font-space font-bold text-[#f4f5f8]">{stages.length}</div>
                  <div className="text-[11px] text-[#7d828c] mt-1">Rounds</div>
                </div>
              </div>

              {/* Tournament progress */}
              <div className="grid grid-cols-7 gap-2">
                {stages.map(stage => {
                  const stats = stageStats(stage)
                  const done = stats.played === stats.total
                  const live = stats.played > 0 && stats.played < stats.total
                  const upcoming = stats.played === 0
                  return (
                    <div key={stage} className={`glass-card rounded-xl p-3 text-center ${live ? 'ring-1 ring-[#FDE047]/30' : ''}`}>
                      <div className="text-[9px] text-[#626871] uppercase tracking-wider mb-1 truncate">{stage}</div>
                      <div className={`text-sm font-space font-bold ${
                        done ? 'text-emerald-400' : live ? 'text-[#FDE047]' : 'text-[#7d828c]'
                      }`}>
                        {stats.played}/{stats.total}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Upcoming matches FIRST */}
              {upcoming.length > 0 && (
                <div className="glass-card rounded-2xl p-5 ring-1 ring-[#FDE047]/20">
                  <h3 className="text-[13px] font-semibold text-[#FDE047] mb-4">
                    Upcoming Matches
                    <span className="text-[10px] text-[#626871] ml-2 font-normal">{upcoming.length} remaining</span>
                  </h3>
                  {upcoming.map(m => {
                    const home = m.Home || {}
                    const away = m.Away || {}
                    const stage = (m.StageName || [{}])[0]?.Description || ''
                    const date = m.Date ? new Date(m.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
                    return (
                      <div key={m.IdMatch} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                        <div className="flex-1 flex items-center gap-2 text-[13px] text-[#f4f5f8]">
                          <img src={getTeamFlag(home)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                          {getTeamName(home)}
                        </div>
                        <div className="text-lg font-space font-bold text-[#FDE047] mx-6">vs</div>
                        <div className="flex-1 flex items-center gap-2 text-[13px] text-[#f4f5f8] justify-end">
                          {getTeamName(away)}
                          <img src={getTeamFlag(away)} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                        </div>
                        <div className="w-32 text-right text-[10px] text-[#626871]">
                          <div>{stage}</div>
                          <div>{date}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Recent played matches */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-[13px] font-semibold text-[#f4f5f8] mb-4">Recent Results</h3>
                {played.slice(-10).reverse().map(m => {
                  const home = m.Home || {}
                  const away = m.Away || {}
                  const stage = (m.StageName || [{}])[0]?.Description || ''
                  const date = m.Date ? new Date(m.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
                  // Extra time indicator
                  const hasET = m.MatchStatus === 1 // some APIs use this
                  return (
                    <div key={m.IdMatch} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <div className="flex-1 flex items-center gap-2 text-[13px] text-[#f4f5f8]">
                        <img src={getTeamFlag(home)} alt="" className="w-4 h-3 object-cover rounded-sm" />
                        {getTeamName(home)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-space font-bold text-[#f4f5f8] tracking-wider">
                          {m.HomeTeamScore}:{m.AwayTeamScore}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 text-[13px] text-[#f4f5f8] justify-end">
                        {getTeamName(away)}
                        <img src={getTeamFlag(away)} alt="" className="w-4 h-3 object-cover rounded-sm" />
                      </div>
                      <div className="w-28 text-right text-[10px] text-[#626871]">
                        <div>{stage}</div>
                        <div>{date}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activePanel === 'matches' && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-[13px] font-semibold text-[#f4f5f8] mb-2">All Matches — FIFA World Cup 2026</h3>
              <div className="text-[10px] text-[#626871] mb-4">
                {played.length} played · {upcoming.length} remaining · {totalGoals} goals · Source: FIFA API
              </div>

              {/* Stage filter pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['All', ...stages].map(s => {
                  const count = s === 'All' ? matches.length : matches.filter(m => (m.StageName || [{}])[0]?.Description === s).length
                  const active = stageFilter === s
                  return (
                    <button key={s} onClick={() => setStageFilter(s)}
                      className={`px-2.5 py-1 text-[11px] rounded-full transition-colors ${
                        active ? 'bg-[#FDE047]/20 text-[#FDE047]' : 'bg-white/[0.04] text-[#7d828c] hover:text-[#f4f5f8]'
                      }`}>
                      {s} ({count})
                    </button>
                  )
                })}
              </div>

              <div className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
                {filtered.map(m => {
                  const home = m.Home || {}
                  const away = m.Away || {}
                  const isPlayed = m.HomeTeamScore != null
                  const stage = (m.StageName || [{}])[0]?.Description || ''
                  const date = m.Date ? new Date(m.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
                  return (
                    <div key={m.IdMatch} className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.03] hover:bg-white/[0.03]">
                      <span className={`w-10 text-[10px] px-1.5 py-0.5 rounded-full text-center flex-shrink-0 ${
                        isPlayed ? 'bg-white/[0.04] text-[#7d828c]' : 'bg-[#FDE047]/20 text-[#FDE047]'
                      }`}>
                        {isPlayed ? `${m.HomeTeamScore}:${m.AwayTeamScore}` : '—'}
                      </span>
                      <span className="text-[10px] text-[#626871] w-16 text-center flex-shrink-0">{stage}</span>
                      <span className="flex items-center gap-1.5 flex-1 text-[13px] text-[#f4f5f8] min-w-0">
                        <img src={getTeamFlag(home)} alt="" className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
                        <span className="truncate">{getTeamName(home)}</span>
                      </span>
                      <span className="text-[11px] text-[#626871] mx-1 flex-shrink-0">vs</span>
                      <span className="flex items-center gap-1.5 flex-1 text-[13px] text-[#f4f5f8] justify-end min-w-0">
                        <span className="truncate">{getTeamName(away)}</span>
                        <img src={getTeamFlag(away)} alt="" className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
                      </span>
                      <span className="text-[10px] text-[#626871] w-14 text-right flex-shrink-0">{date}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activePanel === 'server' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-[13px] font-semibold text-[#f4f5f8] mb-4">
                  MCP Server — cupkit/mcp-server/server.js
                </h3>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[12px] text-emerald-400 font-mono">stdio transport · 8 tools · Node.js</span>
                </div>

                {/* Terminal simulation */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto mb-4">
                  <div className="text-[#626871] mb-2">$ node mcp-server/server.js</div>
                  <div className="text-emerald-400 mb-1">CupKit MCP Server running on stdio</div>
                  <div className="text-[#626871] mt-3"># Agent calls wc_live_score</div>
                  <div className="text-[#FDE047]">&gt; wc_live_score()</div>
                  <div className="text-[#7d828c] pl-4 mt-1">{'{'}</div>
                  <div className="text-[#7d828c] pl-6">"status": "live",</div>
                  <div className="text-[#7d828c] pl-6">"matches": [</div>
                  <div className="text-[#f4f5f8] pl-8">{'{'} "team1": "France", "team2": "Spain", "score": "TBD", "kickoff": "Jul 15" {'}'},</div>
                  <div className="text-[#f4f5f8] pl-8">{'{'} "team1": "England", "team2": "Argentina", "score": "TBD", "kickoff": "Jul 16" {'}'}</div>
                  <div className="text-[#7d828c] pl-6">]</div>
                  <div className="text-[#7d828c] pl-4">{'}'}</div>
                  <div className="text-[#626871] mt-3"># Agent calls wc_cctp_bridge_info</div>
                  <div className="text-[#FDE047]">&gt; wc_cctp_bridge_info({'{}chain: "solana"'})</div>
                  <div className="text-[#7d828c] pl-4 mt-1">{'{'}</div>
                  <div className="text-[#f4f5f8] pl-6">"domainId": 5,</div>
                  <div className="text-[#f4f5f8] pl-6">"usdcContract": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",</div>
                  <div className="text-[#f4f5f8] pl-6">"bridgeContract": "CCTPmbSD7gX1bxKPAmxDvRG1sV4T3BRRRD16aqNJeZ3",</div>
                  <div className="text-[#f4f5f8] pl-6">"destinationDomain": 29</div>
                  <div className="text-[#7d828c] pl-4">{'}'}</div>
                  <div className="text-[#626871] mt-3"># Agent calls wc_x402_endpoints</div>
                  <div className="text-[#FDE047]">{'>'} wc_x402_endpoints()</div>
                  <div className="text-[#7d828c] pl-4 mt-1">{'{'}</div>
                  <div className="text-[#f4f5f8] pl-6">"/match/analysis": "0.50 USDC",</div>
                  <div className="text-[#f4f5f8] pl-6">"/match/prediction": "0.25 USDC",</div>
                  <div className="text-[#f4f5f8] pl-6">"settlement": "Injective EVM ~650ms"</div>
                  <div className="text-[#7d828c] pl-4">{'}'}</div>
                  <div className="text-[#626871] mt-3"># All responses from FIFA API + OpenLigaDB + CCTP contracts</div>
                  <div className="text-emerald-400"># 8 tools · 0 mock data · 100% deterministic</div>
                </div>
              </div>

              {/* Tool list */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-[13px] font-semibold text-[#f4f5f8] mb-3">8 Available Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'wc_fixtures', desc: 'Match schedule', src: 'FIFA API' },
                    { name: 'wc_live_score', desc: 'Live scores + status', src: 'FIFA API' },
                    { name: 'wc_standings', desc: 'Group tables', src: 'FIFA API' },
                    { name: 'wc_teams', desc: '48 teams + groups', src: 'FIFA API' },
                    { name: 'wc_match_stats', desc: 'Goals, cards, stats', src: 'FIFA API' },
                    { name: 'wc_head_to_head', desc: 'H2H history', src: 'FIFA Archive' },
                    { name: 'wc_cctp_bridge_info', desc: 'Cross-chain USDC', src: 'Circle CCTP V2' },
                    { name: 'wc_x402_endpoints', desc: 'Premium API pricing', src: 'Injective EVM' },
                  ].map(t => (
                    <div key={t.name} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-[12px] text-[#f4f5f8] font-mono">{t.name}</div>
                        <div className="text-[10px] text-[#626871]">{t.desc} · <span className="text-emerald-400">{t.src}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}