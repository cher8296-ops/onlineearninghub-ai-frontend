import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, CircleHelp,
  Clipboard, Clock3, Command, FileCheck2, FileText, Globe2, Layers3,
  LoaderCircle, Menu, MessageSquareText, Microscope, Moon, MoreHorizontal,
  PanelLeftClose, PenLine, RefreshCw, ShieldCheck, Sparkles, Sun, WandSparkles,
  X, Zap
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://onlineearninghub-ai.onrender.com").replace(/\/+$/, "");

const tools = [
  { id: "plan", label: "Plan", subtitle: "Turn goals into clear action plans", icon: Layers3, tint: "violet", placeholder: "Describe a goal, project, or challenge. Include your timeline and constraints for a more useful plan.", sample: "Create a practical 7-day plan to launch a beginner freelance writing service." },
  { id: "write", label: "Write", subtitle: "Create polished, useful content", icon: PenLine, tint: "blue", placeholder: "Tell us what you need written, who it is for, and the tone you want.", sample: "Write a professional proposal for a beginner applying to a blog writing job." },
  { id: "research", label: "Research", subtitle: "Explore a topic and understand it", icon: Microscope, tint: "amber", placeholder: "Describe the topic you want to understand. Be specific about the questions you need answered.", sample: "Explain how beginners can find legitimate remote freelance writing clients." },
  { id: "check", label: "Quality check", subtitle: "Review work and find improvements", icon: FileCheck2, tint: "green", placeholder: "Paste the actual text you want reviewed, then say what you want checked.", sample: "Review this proposal for clarity, grammar, professionalism, and completeness: [paste your proposal here]" }
];

function extractOutput(data, toolId) {
  const candidates = {
    plan: ["plan", "content", "result", "output"],
    write: ["content", "written_content", "result", "output"],
    research: ["findings", "content", "result", "output"],
    check: ["review", "feedback", "result", "output"]
  }[toolId] || ["result", "output", "content"];
  for (const key of candidates) {
    if (typeof data?.[key] === "string" && data[key].trim()) return data[key];
  }
  return JSON.stringify(data, null, 2);
}

function App() {
  const [activeTool, setActiveTool] = useState("plan");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [showDetails, setShowDetails] = useState(false);

  const currentTool = useMemo(() => tools.find(t => t.id === activeTool) || tools[0], [activeTool]);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`, { method: "GET", signal: AbortSignal.timeout(12000) });
        if (!cancelled) setApiStatus(response.ok ? "online" : "issue");
      } catch {
        if (!cancelled) setApiStatus("issue");
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const selectTool = (id) => {
    setActiveTool(id);
    setPrompt("");
    setResult(null);
    setError("");
    setCopied(false);
    setMobileNav(false);
  };

  const runTool = async (event) => {
    event.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      const response = await fetch(`${API_BASE}/${activeTool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ description: prompt.trim() }),
        signal: AbortSignal.timeout(90000)
      });
      const raw = await response.text();
      let data;
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { detail: raw || "The server returned an unreadable response." }; }
      if (!response.ok) {
        const message = typeof data?.detail === "string" ? data.detail : `Request failed (${response.status}). Please try again.`;
        throw new Error(message);
      }
      setResult({ data, text: extractOutput(data, activeTool), createdAt: new Date() });
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        setError("The request took too long. The free server may be waking up. Please wait a little and try again.");
      } else if (err instanceof TypeError) {
        setError("We could not connect to the AI service. Check your internet connection and backend CORS settings, then try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const copyResult = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access is unavailable in this browser. Select the result text and copy it manually.");
    }
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} strokeWidth={2.4} /></div>
          <div className="brand-name">OnlineEarning<span>Hub</span><small>AI WORKSPACE</small></div>
          <button className="icon-btn close-mobile" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="AI tools">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return <button key={tool.id} className={`nav-item ${activeTool === tool.id ? "active" : ""}`} onClick={() => selectTool(tool.id)}>
              <span className={`nav-icon ${tool.tint}`}><Icon size={17}/></span>
              <span>{tool.label}</span>
              {activeTool === tool.id && <span className="active-dot"/>}
            </button>;
          })}
        </nav>

        <div className="sidebar-divider"/>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="nav-item muted-nav"><Clock3 size={17}/><span>Recent activity</span><span className="soon">Soon</span></div>
        <div className="nav-item muted-nav"><ShieldCheck size={17}/><span>Account & security</span><span className="soon">Soon</span></div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Zap size={17}/></div>
            <strong>Built for your next big idea.</strong>
            <p>Your AI workspace for planning, writing and better work.</p>
            <span className="preview-tag">EARLY ACCESS</span>
          </div>
          <div className="profile-row">
            <div className="avatar">OH</div>
            <div className="profile-copy"><strong>Guest workspace</strong><small>No account required</small></div>
            <MoreHorizontal size={18} className="profile-more"/>
          </div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{currentTool.label}</strong></div>
          </div>
          <div className="topbar-right">
            <div className={`service-status ${apiStatus}`}><span className="status-dot"/>{apiStatus === "checking" ? "Checking service" : apiStatus === "online" ? "AI service connected" : "Service unavailable"}</div>
            <button className="icon-btn theme-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <button className="help-btn" onClick={() => setShowDetails(!showDetails)}><CircleHelp size={17}/> Help</button>
          </div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line"/> YOUR INTELLIGENT WORKSPACE</div>
              <h1>Make your next move<br/><span>your best move.</span></h1>
              <p className="welcome-copy">One focused workspace to think clearly, create confidently, and move work forward.</p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
              <div className="art-core"><WandSparkles size={31}/></div>
              <div className="art-chip chip-a"><PenLine size={15}/></div>
              <div className="art-chip chip-b"><Microscope size={15}/></div>
              <div className="art-chip chip-c"><Layers3 size={15}/></div>
            </div>
          </section>

          {showDetails && <div className="help-panel"><strong>How to use OnlineEarningHub AI</strong><p>Choose a tool, describe what you need, and select Generate. Your request is sent securely to your configured backend service. Do not submit passwords, payment details, or other sensitive personal information.</p><button onClick={() => setShowDetails(false)}>Got it</button></div>}

          <section className="tool-grid" aria-label="Choose an AI tool">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return <button key={tool.id} className={`tool-card ${activeTool === tool.id ? "selected" : ""}`} onClick={() => selectTool(tool.id)}>
                <div className={`tool-icon ${tool.tint}`}><Icon size={19}/></div>
                <div className="tool-card-copy"><strong>{tool.label}</strong><span>{tool.subtitle}</span></div>
                <ArrowUpRight size={16} className="tool-arrow"/>
              </button>;
            })}
          </section>

          <section className="workspace-panel">
            <div className="panel-heading">
              <div className={`panel-tool-icon ${currentTool.tint}`}><currentTool.icon size={19}/></div>
              <div><div className="panel-title">{currentTool.label} with AI</div><div className="panel-subtitle">{currentTool.subtitle}</div></div>
              <div className="powered-label"><Sparkles size={13}/> AI POWERED</div>
            </div>
            <form onSubmit={runTool}>
              <label className="prompt-label" htmlFor="prompt">What would you like to {activeTool === "check" ? "review" : activeTool === "plan" ? "plan" : activeTool === "write" ? "create" : "research"}?</label>
              <div className="prompt-wrap">
                <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={currentTool.placeholder} rows={5} maxLength={12000} required />
                <div className="prompt-footer"><span>{prompt.length.toLocaleString()} / 12,000 characters</span><button type="button" className="sample-btn" onClick={() => setPrompt(currentTool.sample)}>Try an example <ArrowUpRight size={13}/></button></div>
              </div>
              <div className="form-bottom">
                <div className="privacy-note"><ShieldCheck size={15}/> Your request is processed by the connected AI service.</div>
                <button className="generate-btn" type="submit" disabled={busy || !prompt.trim()}>
                  {busy ? <><LoaderCircle size={17} className="spin"/> Generating...</> : <><Sparkles size={16}/> Generate <ArrowRight size={16}/></>}
                </button>
              </div>
            </form>

            {busy && <div className="loading-state"><div className="loading-mark"><Sparkles size={21}/></div><strong>Working on your request</strong><span>This can take a little longer while the AI service starts up.</span><div className="loading-track"><i/></div></div>}
            {error && <div className="error-box"><div className="error-icon">!</div><div><strong>We couldn't complete that request</strong><p>{error}</p><button onClick={() => setError("")}>Dismiss</button></div></div>}
            {result && !busy && <div className="result-section">
              <div className="result-heading"><div><div className="result-kicker"><CheckCircle2 size={14}/> RESPONSE READY</div><h3>Your result</h3></div><button className="copy-btn" onClick={copyResult}>{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy result"}</button></div>
              <div className="result-meta">
                <span><Sparkles size={13}/> {result.data.agent || currentTool.label}</span>
                {result.data.model_used && <span>Model: {result.data.model_used}</span>}
                {typeof result.data.fallback_used === "boolean" && <span className={result.data.fallback_used ? "fallback-note" : "primary-note"}>{result.data.fallback_used ? "Fallback model used" : "Primary model used"}</span>}
              </div>
              <article className="result-content">{result.text}</article>
              {activeTool === "research" && Array.isArray(result.data.sources) && result.data.sources.length === 0 && <div className="research-note"><Globe2 size={15}/> This response uses AI knowledge and does not include verified live web sources.</div>}
              <div className="result-actions"><button className="secondary-btn" onClick={() => {setResult(null); setPrompt("");}}>Start a new request</button><span>Review AI-generated content before relying on it.</span></div>
            </div>}
          </section>

          <section className="trust-row">
            <div><ShieldCheck size={17}/><span><strong>Privacy-conscious</strong><small>No API keys in your browser</small></span></div>
            <div><Zap size={17}/><span><strong>One connected workspace</strong><small>Four focused AI tools</small></span></div>
            <div><Globe2 size={17}/><span><strong>Made for a global audience</strong><small>Use from anywhere</small></span></div>
          </section>

          <footer className="footer"><div>© {new Date().getFullYear()} OnlineEarningHub AI. All rights reserved.</div><div><span>Independent AI workspace</span><span className="footer-dot">·</span><span>Version 1.0 frontend preview</span></div></footer>
        </div>
      </main>
    </div>
  );
}

export default App;