import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, Clipboard,
  Clock3, Command, FileCheck2, Globe2, History, Layers3, LoaderCircle,
  Menu, Microscope, Moon, PenLine, Plus, RefreshCw, ShieldCheck, Sparkles,
  Sun, WandSparkles, X, Zap, Trash2, Copy, ExternalLink, Share2
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://onlineearninghub-ai.onrender.com").replace(/\/+$/, "");
const HISTORY_KEY = "oeh-ai-history-v1";
const THEME_KEY = "oeh-ai-theme-v1";

const tools = [
  { id: "plan", label: "Strategic planner", short: "Plan", subtitle: "Turn ambitious goals into clear next steps", icon: Layers3, tint: "violet", eyebrow: "THINK WITH CLARITY", placeholder: "What are you trying to achieve? Share your goal, timeline, resources and constraints.", sample: "Build a practical 30-day plan to launch a beginner-friendly freelance writing service. Include weekly milestones, daily actions, free tools, risks and measurable outcomes." },
  { id: "write", label: "Content studio", short: "Write", subtitle: "Create thoughtful, polished communication", icon: PenLine, tint: "blue", eyebrow: "COMMUNICATE WITH IMPACT", placeholder: "What do you need to create? Include the audience, purpose, format and tone.", sample: "Write a compelling, professional proposal for a beginner applying for a remote blog-writing opportunity. Make it confident, specific and honest about my experience." },
  { id: "research", label: "Research desk", short: "Research", subtitle: "Understand topics, options and opportunities", icon: Microscope, tint: "amber", eyebrow: "DISCOVER WHAT MATTERS", placeholder: "What topic or question should we explore? Add your location, context or decision if relevant.", sample: "Research practical ways for a beginner in Ethiopia to find legitimate international remote freelance work. Explain where to look, eligibility, common scams and first steps. Clearly distinguish verified facts from general guidance." },
  { id: "check", label: "Quality review", short: "Review", subtitle: "Strengthen work before it goes out", icon: FileCheck2, tint: "green", eyebrow: "RAISE YOUR STANDARD", placeholder: "Paste the work you want reviewed. Tell us the audience and what a successful result should achieve.", sample: "Review the following text for clarity, grammar, tone, structure and persuasiveness. Give a concise assessment, identify specific weaknesses and provide an improved version:\n\n[Paste your text here]" }
];

function readHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, 12) : [];
  } catch { return []; }
}

function extractOutput(data, toolId) {
  const keys = {
    plan: ["plan", "content", "result", "output"],
    write: ["content", "written_content", "result", "output"],
    research: ["findings", "content", "result", "output"],
    check: ["review", "feedback", "result", "output"]
  }[toolId] || ["result", "output", "content"];
  for (const key of keys) {
    if (typeof data?.[key] === "string" && data[key].trim()) return data[key];
  }
  return JSON.stringify(data, null, 2);
}

function App() {
  const [activeTool, setActiveTool] = useState("plan");
  const [view, setView] = useState("workspace");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; }
  });
  const [apiStatus, setApiStatus] = useState("checking");
  const [history, setHistory] = useState(readHistory);
  const [healthCheckedAt, setHealthCheckedAt] = useState(null);

  const currentTool = useMemo(() => tools.find(item => item.id === activeTool) || tools[0], [activeTool]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 12))); } catch {}
  }, [history]);

  const checkHealth = async () => {
    setApiStatus("checking");
    try {
      const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(12000), cache: "no-store" });
      const health = response.ok ? await response.json() : null;
      setApiStatus(!response.ok ? "issue" : health?.ai_configured === false ? "not_configured" : "online");
      setHealthCheckedAt(new Date());
    } catch {
      setApiStatus("issue");
      setHealthCheckedAt(new Date());
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(12000), cache: "no-store" });
        const health = response.ok ? await response.json() : null;
        if (!cancelled) { setApiStatus(!response.ok ? "issue" : health?.ai_configured === false ? "not_configured" : "online"); setHealthCheckedAt(new Date()); }
      } catch {
        if (!cancelled) { setApiStatus("issue"); setHealthCheckedAt(new Date()); }
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const chooseTool = (id) => {
    setActiveTool(id);
    setView("workspace");
    setPrompt("");
    setResult(null);
    setError("");
    setCopied(false);
    setMobileNav(false);
  };

  const runTool = async (event) => {
    event.preventDefault();
    const description = prompt.trim();
    if (!description || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      const response = await fetch(`${API_BASE}/${activeTool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ description }),
        signal: AbortSignal.timeout(120000)
      });
      const raw = await response.text();
      let data;
      try { data = raw ? JSON.parse(raw) : {}; }
      catch { data = { detail: raw || "The server returned an unreadable response." }; }
      if (!response.ok) {
        const detail = typeof data?.detail === "string" ? data.detail : "";
        if (response.status === 503) throw new Error(detail || "The AI provider is temporarily unavailable or overloaded. Your request was not completed. Please wait a few minutes and retry.");
        if (response.status === 429) throw new Error(detail || "The AI usage limit has been reached. Please wait before trying again.");
        if (response.status === 401 || response.status === 403) throw new Error(detail || "The AI service rejected this request. Please check the server configuration.");
        throw new Error(detail || `Request failed (HTTP ${response.status}). Please try again.`);
      }
      const text = extractOutput(data, activeTool);
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        toolId: activeTool,
        toolLabel: currentTool.short,
        prompt: description,
        text,
        createdAt: new Date().toISOString(),
        model: typeof data?.model_used === "string" ? data.model_used : ""
      };
      setResult({ data, text });
      setHistory(previous => [item, ...previous].slice(0, 12));
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        setError("This request timed out. The free hosting service may be waking up, or the AI provider may be slow. Please retry in a moment.");
      } else if (err instanceof TypeError) {
        setError("We could not reach the backend. Check your connection, then use the status control above to test the service again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const shareSite = async () => {
    const shareData = { title: "FlowChera21 — AI Earning Hub", text: "A focused AI workspace to plan, write, research and quality-check your work.", url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (err) {
      if (err?.name !== "AbortError") setError("Sharing is unavailable here. You can copy the website address from your browser.");
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access is unavailable. Select the text and copy it manually.");
    }
  };

  const openHistoryItem = (item) => {
    setActiveTool(item.toolId);
    setPrompt(item.prompt);
    setResult({ data: { model_used: item.model }, text: item.text });
    setError("");
    setView("workspace");
    setMobileNav(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <button className="brand" onClick={() => { setView("workspace"); setMobileNav(false); }} aria-label="FlowChera21 home">
          <span className="brand-mark"><Sparkles size={19}/></span>
          <span className="brand-name">FlowChera21<small>AI EARNING HUB</small></span>
          <span className="brand-version">AI</span>
        </button>

        <div className="nav-caption">YOUR WORKSPACE</div>
        <nav className="nav-list" aria-label="Workspace navigation">
          <button className={`nav-item ${view === "workspace" ? "active" : ""}`} onClick={() => { setView("workspace"); setMobileNav(false); }}>
            <span className="nav-icon neutral"><Command size={17}/></span><span>Workspace</span><ChevronRight className="nav-chevron" size={15}/>
          </button>
          <button className={`nav-item ${view === "history" ? "active" : ""}`} onClick={() => { setView("history"); setMobileNav(false); }}>
            <span className="nav-icon neutral"><History size={17}/></span><span>Recent activity</span><span className="nav-count">{history.length}</span>
          </button>
        </nav>

        <div className="nav-caption tools-caption">AI CAPABILITIES</div>
        <nav className="nav-list" aria-label="AI tools">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return <button key={tool.id} className={`nav-item ${view === "workspace" && activeTool === tool.id ? "active" : ""}`} onClick={() => chooseTool(tool.id)}>
              <span className={`nav-icon ${tool.tint}`}><Icon size={17}/></span><span>{tool.short}</span>
              {view === "workspace" && activeTool === tool.id && <span className="active-dot"/>}
            </button>;
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <div className="promo-orb"><WandSparkles size={18}/></div>
            <span className="promo-label">BUILT TO MOVE YOU FORWARD</span>
            <strong>Make good ideas happen.</strong>
            <p>One calm, focused space for your next step.</p>
            <div className="promo-foot"><span><Zap size={13}/> Four AI tools</span><span>Free access</span></div>
          </div>
          <div className="sidebar-profile">
            <div className="profile-avatar">FC</div>
            <div className="profile-text"><strong>Personal workspace</strong><small>Private on this device</small></div>
            <ShieldCheck size={17} className="profile-shield"/>
          </div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main className="main" id="main-content" tabIndex="-1">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb"><span>FlowChera21</span><b>/</b><strong>{view === "history" ? "Recent activity" : currentTool.short}</strong></div>
          </div>
          <div className="topbar-right">
            <button className={`service-status ${apiStatus}`} onClick={checkHealth} title="Check backend availability" aria-label="Check backend availability" aria-live="polite">
              <span className="status-dot"/><span>{apiStatus === "checking" ? "Checking backend" : apiStatus === "online" ? "Backend online" : apiStatus === "not_configured" ? "AI not configured" : "Service unavailable"}</span><RefreshCw size={13} className={apiStatus === "checking" ? "spin" : ""}/>
            </button>
            <span className="topbar-divider"/>
            <button className="icon-btn theme-btn" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <a className="topbar-link" href="https://onlineearninghub-ai.onrender.com/docs" target="_blank" rel="noreferrer">API docs <ExternalLink size={13}/></a>
          </div>
        </header>

        <div className="content">
          {view === "workspace" ? (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-mark"/> YOUR IDEAS, WITH MOMENTUM</div>
                  <h1>Think bigger.<br/><span>Move smarter.</span></h1>
                  <p className="hero-description">A focused AI workspace to turn questions into clarity, ideas into action, and good work into great work.</p>
                  <div className="hero-proof"><span><CheckCircle2 size={15}/> Four focused tools</span><i/><span><Globe2 size={15}/> Made for everyone</span><button type="button" className="share-site-btn" onClick={shareSite}><Share2 size={14}/> Share</button></div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="visual-glow"/><div className="visual-ring ring-a"/><div className="visual-ring ring-b"/>
                  <div className="visual-center"><Sparkles size={32}/></div>
                  <div className="visual-float float-one"><PenLine size={17}/></div>
                  <div className="visual-float float-two"><Microscope size={17}/></div>
                  <div className="visual-float float-three"><Layers3 size={17}/></div>
                  <span className="visual-star star-one">✳</span><span className="visual-star star-two">✦</span>
                </div>
              </section>

              <div className="section-heading"><div><span className="section-kicker">YOUR AI TOOLKIT</span><h2>What are we working on?</h2></div><span className="section-note">Choose a starting point</span></div>
              <section className="tool-grid" aria-label="Choose an AI tool">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return <button key={tool.id} className={`tool-card ${activeTool === tool.id ? "selected" : ""}`} onClick={() => chooseTool(tool.id)}>
                    <div className="tool-card-top"><span className={`tool-icon ${tool.tint}`}><Icon size={20}/></span><span className="tool-index">0{index + 1}</span></div>
                    <strong>{tool.label}</strong><p>{tool.subtitle}</p><span className="tool-open">Open tool <ArrowUpRight size={14}/></span>
                  </button>;
                })}
              </section>

              <section className="workspace-panel">
                <div className="panel-heading">
                  <div className={`panel-tool-icon ${currentTool.tint}`}><currentTool.icon size={20}/></div>
                  <div className="panel-heading-copy"><span className="panel-kicker">{currentTool.eyebrow}</span><h2>{currentTool.label}</h2><p>{currentTool.subtitle}</p></div>
                  <div className="powered-label"><Sparkles size={13}/> AI ASSISTED</div>
                </div>
                <form onSubmit={runTool}>
                  <label className="prompt-label" htmlFor="prompt">Tell us what you have in mind</label>
                  <div className="prompt-wrap">
                    <textarea id="prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={currentTool.placeholder} rows={5} maxLength={10000} required />
                    <div className="prompt-footer"><span>{prompt.length.toLocaleString()} / 10,000</span><button type="button" className="sample-btn" onClick={() => { setPrompt(currentTool.sample); setError(""); }}>Use a sample prompt <ArrowUpRight size={13}/></button></div>
                  </div>
                  <div className="form-bottom"><div className="privacy-note"><ShieldCheck size={15}/><span>Your API key stays on the server. Avoid sharing sensitive information.</span></div>
                    <button className="generate-btn" type="submit" disabled={busy || !prompt.trim()}>{busy ? <><LoaderCircle size={17} className="spin"/> Working...</> : <><Sparkles size={16}/> Generate response <ArrowRight size={16}/></>}</button>
                  </div>
                </form>

                {busy && <div className="loading-state"><div className="loading-mark"><Sparkles size={21}/></div><strong>Creating something useful</strong><span>Your request is being processed. The first response may take longer on free hosting.</span><div className="loading-track"><i/></div></div>}
                {error && <div className="error-box" role="alert"><span className="error-icon">!</span><div><strong>We couldn't complete your request</strong><p>{error}</p><button type="button" onClick={() => { setError(""); }}>Dismiss</button></div></div>}
                {result && !busy && <div className="result-section">
                  <div className="result-heading"><div><div className="result-kicker"><CheckCircle2 size={14}/> RESPONSE READY</div><h3>Your result</h3></div><button type="button" className="copy-btn" onClick={() => copyText(result.text)}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy response"}</button></div>
                  <div className="result-meta"><span><Sparkles size={13}/> {result.data.agent || currentTool.short}</span>{result.data.model_used && <span>Model: {result.data.model_used}</span>}{typeof result.data.fallback_used === "boolean" && <span className={result.data.fallback_used ? "fallback-note" : "primary-note"}>{result.data.fallback_used ? "Fallback model" : "Primary model"}</span>}</div>
                  <article className="result-content" aria-live="polite">{result.text}</article>
                  {activeTool === "research" && result.data.warning && <div className="research-note"><Globe2 size={15}/> {result.data.warning}</div>}
                  {activeTool === "research" && Array.isArray(result.data.sources) && result.data.sources.length === 0 && !result.data.warning && <div className="research-note"><Globe2 size={15}/> This response is AI-generated and does not contain verified live web sources.</div>}
                  {activeTool === "research" && Array.isArray(result.data.sources) && result.data.sources.some(source => (source?.url?.startsWith("https://") || source?.url?.startsWith("http://"))) && <div className="research-sources"><strong>Sources</strong>{result.data.sources.filter(source => (source?.url?.startsWith("https://") || source?.url?.startsWith("http://"))).map((source, index) => <a key={source.url || index} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}</div>}
                  <div className="result-actions"><button type="button" className="secondary-btn" onClick={() => { setResult(null); setPrompt(""); }}> <Plus size={14}/> New request</button><span>Check important facts before acting on AI-generated content.</span></div>
                </div>}
              </section>

              <div className="bottom-note"><div className="bottom-note-icon"><ShieldCheck size={17}/></div><div><strong>Designed for focused, responsible work</strong><span>Review generated content and verify important information before making decisions.</span></div><button type="button" onClick={() => setView("history")}>View activity <ArrowRight size={14}/></button></div>
            </>
          ) : (
            <section className="history-page">
              <div className="eyebrow"><span className="eyebrow-mark"/> YOUR WORK, IN ONE PLACE</div>
              <div className="history-title-row"><div><h1>Recent <span>activity.</span></h1><p className="hero-description">Your latest AI responses, saved privately in this browser.</p></div>{history.length > 0 && <button className="clear-history" onClick={clearHistory}><Trash2 size={15}/> Clear history</button>}</div>
              {history.length === 0 ? <div className="empty-history"><div className="empty-icon"><History size={25}/></div><h2>A fresh start.</h2><p>Your completed AI requests will appear here. Your activity is stored only in this browser.</p><button className="generate-btn" onClick={() => setView("workspace")}>Go to workspace <ArrowRight size={15}/></button></div> :
                <div className="history-list">{history.map(item => <article className="history-item" key={item.id}><div className={`history-icon ${tools.find(tool => tool.id === item.toolId)?.tint || "violet"}`}>{(() => { const Icon = tools.find(tool => tool.id === item.toolId)?.icon || Sparkles; return <Icon size={18}/>; })()}</div><div className="history-copy"><div className="history-meta"><strong>{item.toolLabel}</strong><span>{new Date(item.createdAt).toLocaleString()}</span></div><p>{item.prompt}</p><span className="history-preview">{item.text.slice(0, 170)}{item.text.length > 170 ? "…" : ""}</span></div><button className="history-open" onClick={() => openHistoryItem(item)} aria-label="Open saved response"><ArrowUpRight size={17}/></button></article>)}</div>}
            </section>
          )}

          <footer className="footer"><span>© {new Date().getFullYear()} FlowChera21 · AI Earning Hub</span><span className="footer-links"><a href="/learn.html">Learn</a><a href="/about.html">About</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="https://onlineearninghub-ai.onrender.com/docs" target="_blank" rel="noreferrer">API docs</a></span><span><i/> Independent AI workspace <b>·</b> AI output may be inaccurate; verify important information.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
