import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

function Loader() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div className="loader">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>
    </div>
  )
}

function TickerSection() {
  const tickerRef = useRef(null)
  const words = "In every bottle, discover the undeniable Real Magic of sharing pure Refreshment that brings us Together".split(' ')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.ticker-track', {
        x: '-50%',
        ease: 'none',
        scrollTrigger: {
          trigger: tickerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      })
    }, tickerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={tickerRef} className="relative bg-deep-onyx py-20 overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap gap-8" style={{ width: 'max-content' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 text-4xl font-space font-bold text-white/20">
            {words.map((word, j) => (
              <span key={j} className="inline-block">
                {word}
                {j % 6 === 5 && (
                  <svg className="inline-block w-8 h-8 mx-4 align-middle" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#FDE047" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M12 16l3 3 5-6" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            ))}
            <span className="text-cyber-yellow mx-8">◆</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Header({ scrolled }) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'h-16 bg-deep-onyx/80 backdrop-blur-xl border-b border-white/10' 
        : 'h-20 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className={`font-space font-bold tracking-tighter transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`} style={{ color: scrolled ? '#fff' : '#0A0A0A' }}>
            CUPKIT
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>Features</a>
          <a href="#how" className={`text-sm font-medium transition-colors ${scrolled ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>How It Works</a>
          <a href="#tech" className={`text-sm font-medium transition-colors ${scrolled ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>Tech Stack</a>
          <Link to="/dashboard" className="px-5 py-2 bg-deep-onyx text-white text-sm font-medium rounded-full hover:scale-105 transition-transform">
            Launch Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 noise-bg pointer-events-none"></div>
        <div className="longfazers"><span></span><span></span><span></span><span></span></div>
        <Loader />
        <div className="z-20 text-center mt-8 space-y-4">
          <h1 className="font-space text-4xl font-bold tracking-tighter text-black uppercase animate-pulse">
            Initializing CupKit
          </h1>
          <p className="font-outfit text-gray-400 font-light tracking-widest uppercase text-xs">
            Connecting to Injective Network
          </p>
          <div className="w-64 h-1 bg-gray-100 rounded-full mx-auto mt-12 overflow-hidden relative">
            <div className="h-full bg-black w-1/3 animate-[progress_3s_ease-in-out_infinite]"></div>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 flex flex-col items-start space-y-2 opacity-40">
          <div className="flex items-center space-x-2 text-[10px] font-space">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-black">NODE ONLINE</span>
          </div>
          <div className="text-[10px] font-outfit text-gray-500 uppercase tracking-tighter">
            X402 · CCTP · MCP · AGENT SKILL
          </div>
        </div>
        <div className="absolute top-12 right-12 text-right opacity-40">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-[10px] font-space text-black font-bold uppercase tracking-widest">
            LATENCY: 14ms
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-deep-onyx font-inter">
      <Header scrolled={scrolled} />

      {/* Hero Section - Liquid */}
      <section className="min-h-screen bg-cyber-yellow liquid-bottom relative overflow-hidden flex items-center">
        <div className="absolute inset-0 noise-bg pointer-events-none"></div>
        <div className="absolute top-32 right-0 w-[600px] h-[600px] opacity-20">
          <svg viewBox="0 0 600 600" fill="none">
            <circle cx="300" cy="300" r="250" stroke="#0A0A0A" strokeWidth="1" />
            <circle cx="300" cy="300" r="180" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="8 8" />
            <circle cx="300" cy="300" r="100" stroke="#0A0A0A" strokeWidth="2" />
            <line x1="300" y1="50" x2="300" y2="550" stroke="#0A0A0A" strokeWidth="1" />
            <line x1="50" y1="300" x2="550" y2="300" stroke="#0A0A0A" strokeWidth="1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-2xl">
            {/* No mini headline — product speaks for itself */}
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-deep-onyx leading-[0.95]">
              World Cup
              <br />
              <span className="relative">
                Agent SDK
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 text-lg text-black/60 max-w-lg leading-relaxed">
              One Agent Skill. Four Injective technologies. Give any AI agent the power to query live World Cup data, bridge USDC cross-chain via CCTP, and monetize APIs with x402 — in one import.
            </p>
            <div className="flex gap-4 mt-10">
              <Link to="/dashboard" className="px-8 py-4 bg-deep-onyx text-white font-medium rounded-full hover:scale-105 transition-transform">
                Open Dashboard
              </Link>
              <a href="#features" className="px-8 py-4 border-2 border-black/20 text-black font-medium rounded-full hover:bg-black/5 transition-colors">
                See Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <TickerSection />

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-cyber-yellow text-xs font-bold uppercase tracking-widest">Four Technologies</span>
            <h2 className="text-5xl font-bold text-white mt-4">One Agent Skill to Rule Them All</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><path d="M18 3L7 18h8l-2 11 11-14h-8l2-12z" stroke="#FDE047" strokeWidth="2" strokeLinejoin="round"/></svg>, 
                title: 'x402 Payments', 
                desc: 'Monetize any World Cup data endpoint with HTTP 402 micropayments. Settles in 650ms on Injective EVM.' 
              },
              { 
                icon: <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="#FDE047" strokeWidth="2"/><path d="M16 4v8M16 20v8M4 16h8M20 16h8" stroke="#FDE047" strokeWidth="2"/><circle cx="16" cy="16" r="4" fill="#FDE047"/></svg>, 
                title: 'CCTP Bridging', 
                desc: 'Fans onboard from Ethereum, Solana, Base — any chain. Native USDC flows into Injective via Circle CCTP.' 
              },
              { 
                icon: <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="4" stroke="#FDE047" strokeWidth="2"/><rect x="8" y="10" width="16" height="4" rx="1" fill="#FDE047" opacity="0.3"/><rect x="8" y="16" width="10" height="2" rx="1" fill="#FDE047" opacity="0.2"/><rect x="8" y="20" width="13" height="2" rx="1" fill="#FDE047" opacity="0.2"/></svg>, 
                title: 'MCP Server', 
                desc: 'Standardized tools: wc_live_score, wc_fixtures, wc_cctp_bridge. Any MCP-compatible agent can query.' 
              },
              { 
                icon: <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="10" r="6" stroke="#FDE047" strokeWidth="2"/><path d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#FDE047" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="9" r="1.5" fill="#FDE047"/><circle cx="18" cy="9" r="1.5" fill="#FDE047"/><path d="M13 12h6" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round"/></svg>, 
                title: 'Agent Skill', 
                desc: 'Import one skill file. Your AI agent gets all four technologies. Works with Claude Code, Cursor, Codex.' 
              },
            ].map((f, i) => (
              <div key={i} className="glass-card rounded-[32px] p-8 group hover:bg-white/[0.15] transition-all duration-300">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-space font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-32 px-6 bg-charcoal liquid-top">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-cyber-yellow text-xs font-bold uppercase tracking-widest">Architecture</span>
            <h2 className="text-5xl font-bold text-white mt-4">How CupKit Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Import the Skill', desc: 'Add cupkit.skill.md to your agent project. One line in your config, all four Injective technologies available.' },
              { step: '02', title: 'Agent Queries Data', desc: 'Your AI agent calls wc_live_score, wc_fixtures, wc_standings — live World Cup data from OpenLigaDB.' },
              { step: '03', title: 'Fans Transact', desc: 'End users bridge USDC via CCTP, pay for premium insights via x402, earn rewards — cross-chain, near-instant.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-space font-bold text-cyber-yellow/20 mb-4">{s.step}</div>
                <h3 className="text-white font-space font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Code block */}
          <div className="mt-16 glass-card rounded-[32px] p-8 font-mono text-sm overflow-x-auto">
            <div className="text-white/40 mb-2"># Install CupKit Agent Skill</div>
            <div className="text-emerald-400">$ npm install @cupkit/skill</div>
            <div className="text-white/40 mt-4 mb-2"># Your agent now has World Cup capabilities</div>
            <div className="text-white/60">
              <span className="text-cyber-yellow">import</span> cupkit <span className="text-cyber-yellow">from</span> <span className="text-emerald-400">'@cupkit/skill'</span>
            </div>
            <div className="text-white/60 mt-1">
              <span className="text-white/40">// Query live scores, bridge USDC, pay via x402</span>
            </div>
            <div className="text-white/60">
              <span className="text-cyber-yellow">const</span> score = <span className="text-cyber-yellow">await</span> cupkit.<span className="text-blue-400">wc_live_score</span>(<span className="text-emerald-400">'ARG-vs-BRA'</span>)
            </div>
            <div className="text-white/60">
              <span className="text-cyber-yellow">const</span> tx = <span className="text-cyber-yellow">await</span> cupkit.<span className="text-blue-400">cctp_bridge</span>({'{'} from: <span className="text-emerald-400">'solana'</span>, amount: <span className="text-emerald-400">'10 USDC'</span> {'}'})
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-cyber-yellow text-xs font-bold uppercase tracking-widest">Tech Stack</span>
          <h2 className="text-5xl font-bold text-white mt-4 mb-16">Built on Injective</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {['x402 Protocol', 'CCTP V2', 'MCP Server', 'Agent Skills'].map((tech, i) => (
              <div key={i} className="glass-card rounded-full px-8 py-6 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="text-white font-space font-bold text-sm">{tech}</span>
              </div>
            ))}
          </div>

          {/* Partner logos ticker */}
          <div className="mt-24 flex justify-center items-center gap-12 opacity-30">
            {['INJECTIVE', 'CIRCLE CCTP', 'LAYERZERO', 'MCP', 'CLAUDE CODE', 'CURSOR', 'CODEX'].map((p, i) => (
              <span key={i} className="text-white font-space font-bold text-xs tracking-widest">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-space font-bold text-white text-lg">CUPKIT</span>
          </Link>
          <div className="text-white/30 text-sm">
            CupKit · Open Source
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/subheeksh5599/cupkit" target="_blank" rel="noopener" className="text-white/40 hover:text-cyber-yellow transition-colors text-sm">GitHub</a>
            <a href="https://github.com/subheeksh5599/cupkit#readme" target="_blank" rel="noopener" className="text-white/40 hover:text-cyber-yellow transition-colors text-sm">Docs</a>
            <a href="https://x.com/KomariS18774" target="_blank" rel="noopener" className="text-white/40 hover:text-cyber-yellow transition-colors text-sm">X</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
