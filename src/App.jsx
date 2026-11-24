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
const LANGUAGE_KEY = "oeh-ai-language-v1";
const UI_TEXT = {
  en: { workspace:"Workspace", activity:"Recent activity", capabilities:"AI CAPABILITIES", share:"Share", skip:"Skip to main content", api:"API docs", nav:"YOUR WORKSPACE", heroEyebrow:"YOUR IDEAS, WITH MOMENTUM", heroTitleA:"Think bigger.", heroTitleB:"Move smarter.", heroDesc:"A focused AI workspace to turn questions into clarity, ideas into action, and good work into great work.", proofTools:"Four focused tools", proofEveryone:"Made for everyone", toolkit:"YOUR AI TOOLKIT", toolkitTitle:"What are we working on?", toolkitNote:"Choose a starting point", cardOpen:"Open tool", promptLabel:"Tell us what you have in mind", sampleBtn:"Use a sample prompt", privacy:"Your API key stays on the server. Avoid sharing sensitive information.", generate:"Generate response", working:"Working...", loadingTitle:"Creating something useful", loadingDesc:"Your request is being processed. The first response may take longer on free hosting.", errorTitle:"We couldn't complete your request", dismiss:"Dismiss", responseReady:"RESPONSE READY", resultTitle:"Your result", copy:"Copy response", copied:"Copied", newRequest:"New request", verifyNote:"Check important facts before acting on AI-generated content.", researchNoSources:"This response is AI-generated and does not contain verified live web sources.", sources:"Sources", bottomTitle:"Designed for focused, responsible work", bottomDesc:"Review generated content and verify important information before making decisions.", viewActivity:"View activity", historyEyebrow:"YOUR WORK, IN ONE PLACE", historyTitle:"Recent", historyDesc:"Your latest AI responses, saved privately in this browser.", clearHistory:"Clear history", emptyTitle:"A fresh start.", emptyDesc:"Your completed AI requests will appear here. Your activity is stored only in this browser.", goWorkspace:"Go to workspace", footerIndependent:"Independent AI workspace", footerDisclaimer:"AI output may be inaccurate; verify important information.", privacyTitle:"Private on this device", promoLabel:"BUILT TO MOVE YOU FORWARD", promoTitle:"Make good ideas happen.", promoDesc:"One calm, focused space for your next step.", freeAccess:"Free access", statusChecking:"Checking backend", statusOnline:"Backend online", statusNotConfigured:"AI not configured", statusIssue:"Service unavailable", menuOpen:"Open menu", statusCheck:"Check backend availability", navWorkspace:"Workspace navigation", navTools:"AI tools", formPlaceholder:"Describe your request...", aiAssisted:"AI ASSISTED", yourWork:"YOUR WORK, IN ONE PLACE", researchWarning:"Live web search may not be available; verify time-sensitive facts.", toolPlan:"Strategic planner", toolPlanSub:"Turn ambitious goals into clear next steps", toolWrite:"Content studio", toolWriteSub:"Create thoughtful, polished communication", toolResearch:"Research desk", toolResearchSub:"Understand topics, options and opportunities", toolCheck:"Quality review", toolCheckSub:"Strengthen work before it goes out", placeholderPlan:"What are you trying to achieve? Share your goal, timeline, resources and constraints.", placeholderWrite:"What do you need to create? Include the audience, purpose, format and tone.", placeholderResearch:"What topic or question should we explore? Add your location, context or decision if relevant.", placeholderCheck:"Paste the work you want reviewed. Tell us the audience and what a successful result should achieve.", samplePlan:"Build a practical 30-day plan to launch a beginner-friendly freelance writing service. Include weekly milestones, daily actions, free tools, risks and measurable outcomes.", sampleWrite:"Write a compelling, professional proposal for a beginner applying for a remote blog-writing opportunity. Make it confident, specific and honest about my experience.", sampleResearch:"Research practical ways for a beginner in Ethiopia to find legitimate international remote freelance work. Explain where to look, eligibility, common scams and first steps. Clearly distinguish verified facts from general guidance.", sampleCheck:"Review the following text for clarity, grammar, tone, structure and persuasiveness. Give a concise assessment, identify specific weaknesses and provide an improved version:\n\n[Paste your text here]", toolCountLabel:"Four AI tools", workspaceProfile:"Personal workspace", privateDevice:"Private on this device", modelLabel:"Model:", fallbackModel:"Fallback model", primaryModel:"Primary model", shareError:"Sharing is unavailable here. You can copy the website address from your browser.", timeoutError:"This request timed out. The AI service may be slow or waking up; please retry.", connectionError:"Could not reach the service. Check your connection and retry.", genericError:"Something went wrong. Please try again.", clipboardError:"Clipboard access is unavailable. Select and copy the text manually." },
  om: { workspace:"Iddoo hojii", activity:"Hojii dhiheenya", capabilities:"DANDEETII AI", share:"Qoodii", skip:"Gara qabiyyee ijoo darbii", api:"Dokumantii API", nav:"IDDOO HOJII KEE", heroEyebrow:"YAADA KEE SOCHII QABSIISI", heroTitleA:"Bal'inaan yaadi.", heroTitleB:"Ogeessaadhaan tarkaanfadhu.", heroDesc:"Iddoo hojii AI gaaffii gara hubannoo, yaada gara hojii, hojii gaarii gara hojii qulqullina qabuutti jijjiiru.", proofTools:"Meeshaalee AI afur", proofEveryone:"Namoota hundaaf", toolkit:"MEESHALEE AI KEE", toolkitTitle:"Maali irratti hojjechaa jirra?", toolkitNote:"Meeshaa filadhu", cardOpen:"Meeshaa bani", promptLabel:"Waan barbaaddu ibsi", sampleBtn:"Fakkeenya gaaffii fayyadami", privacy:"API key kee server irratti eegama. Odeeffannoo dhuunfaa ykn iccitii hin qoodin.", generate:"Deebii uumi", working:"Hojjetaa jira...", loadingTitle:"Deebii faayidaa qabu qopheessaa jira", loadingDesc:"Gaaffiin kee hojjetamaa jira. Hosting bilisaa irratti deebiin jalqabaa yeroo fudhachuu danda'a.", errorTitle:"Gaaffii kee xumuruu hin dandeenye", dismiss:"Cufi", responseReady:"DEEBIIN QOPHAAYE", resultTitle:"Deebii kee", copy:"Deebii koppii godhi", copied:"Koppii gale", newRequest:"Gaaffii haaraa", verifyNote:"Odeeffannoo AI irraa argame hojii irra oolchuu dura mirkaneessi.", researchNoSources:"Deebiin kun AI'n uumame; madda weebii yeroo ammaa mirkanaa'e hin qabu.", sources:"Maddoota", bottomTitle:"Hojii xiyyeeffannoo fi itti gaafatamummaa qabuuf qophaa'e", bottomDesc:"Qabiyyee AI'n uumame sakatta'i; odeeffannoo barbaachisaa mirkaneessi.", viewActivity:"Hojii dhiheenya ilaali", historyEyebrow:"HOJII KEE IDDOO TOKKO", historyTitle:"Hojii", historyDesc:"Deebii AI dhiheenya kanaa; browser kana keessatti dhuunfaadhaan kuufama.", clearHistory:"Seenaa qulqulleessi", emptyTitle:"Jalqaba haaraa.", emptyDesc:"Gaaffii AI xumurte asitti mul'ata. Seenaa kee browser kana qofa keessatti kuufama.", goWorkspace:"Iddoo hojii deebi'i", footerIndependent:"Iddoo hojii AI of danda'e", footerDisclaimer:"Deebiin AI dogoggora qabaachuu danda'a; odeeffannoo barbaachisaa mirkaneessi.", privacyTitle:"Meeshaa kana irratti dhuunfaa", promoLabel:"TARKAANFII KEE JAJJABEESSUUF", promoTitle:"Yaada gaarii gara dhugaa geessi.", promoDesc:"Tarkaanfii itti aanuuf bakka tasgabbaa'aa, xiyyeeffannoo qabu.", freeAccess:"Bilisaa", statusChecking:"Backend sakatta'aa", statusOnline:"Backend online", statusNotConfigured:"AI hin qindaa'in", statusIssue:"Tajaajilli hin argamu", menuOpen:"Menu bani", statusCheck:"Backend sakatta'i", navWorkspace:"Navigeshinii iddoo hojii", navTools:"Meeshaalee AI", formPlaceholder:"Gaaffii kee ibsi...", aiAssisted:"AI GARGAARAA", yourWork:"HOJII KEE IDDOO TOKKO", researchWarning:"Barbaacha weebii yeroo ammaa hin arganne ta'uu danda'a; odeeffannoo yeroo irratti hundaa'e mirkaneessi.", toolPlan:"Karoora tarsiimoo", toolPlanSub:"Kaayyoo kee tarkaanfii ifa ta'etti jijjiiri", toolWrite:"Studio barreessuu", toolWriteSub:"Barreeffama qulqulluu fi ogummaa qabu uumi", toolResearch:"Iddoo qorannoo", toolResearchSub:"Mata-duree, filannoo fi carraa hubadhu", toolCheck:"Sakatta'a qulqullinaa", toolCheckSub:"Hojii kee erguu dura fooyyessi", placeholderPlan:"Maal galmaan ga'uu barbaadda? Kaayyoo, yeroo, qabeenya fi daangaa kee ibsi.", placeholderWrite:"Maal barreessuu barbaadda? Namoota dubbisan, kaayyoo, bifa fi sagalee ibsi.", placeholderResearch:"Mata-duree ykn gaaffii maal qoranna? Bakka, haala ykn murtii kee dabali.", placeholderCheck:"Barreeffama sakatta'amu as maxxansi. Dubbisaa fi bu'aa barbaaddu ibsi.", samplePlan:"Tajaajila barreessuu freelance jalqabaa beeksisuuf karoora guyyoota 30 qopheessi. Milestones torbanitti, hojii guyyaa, meeshaalee bilisaa, balaa fi bu'aa madaalamuu qabu dabali.", sampleWrite:"Nama jalqabaa hojii blog barreessuu remote gaafatuuf proposal ogummaa qabu barreessi. Muuxannoo koo irratti soba osoo hin taane, ofitti amanamummaa fi ibsa ifa ta'e fayyadami.", sampleResearch:"Nama Ethiopia keessatti jalqabuuf hojii freelance remote seera-qabeessa addunyaa irratti argachuuf karaalee qoradhu. Bakka barbaadan, ulaagaa, scam fi tarkaanfii jalqabaa ibsi. Dhugaa mirkanaa'e fi gorsa waliigalaa adda baasi.", sampleCheck:"Barreeffama kana ifa ta'uu, seera afaanii, sagalee, caasaa fi amansiisummaa irratti sakatta'i. Madaallii gabaabaa kenni, hanqina adda baasi, barruu fooyya'aa barreessi:\n\n[Barreeffama kee as kaa'i]", toolCountLabel:"Meeshaalee AI afur", workspaceProfile:"Iddoo hojii dhuunfaa", privateDevice:"Meeshaa kana irratti dhuunfaa", modelLabel:"Model:", fallbackModel:"Modelii bakka bu'aa", primaryModel:"Modelii jalqabaa", shareError:"Qooduun hin danda'amne. Teessoo weebsaayitii browser keessaa koppii godhi.", timeoutError:"Gaaffiin kun yeroo dheeraa fudhate. Tajaajilli AI suuta hojjechaa ykn ka'aa jiraachuu danda'a; irra deebi'i.", connectionError:"Tajaajila bira gahuu hin dandeenye. Connection kee sakatta'i, irra deebi'i.", genericError:"Rakkoon uumame. Maaloo irra deebi'i.", clipboardError:"Clipboard hin argamu. Barruu filadhuutii harkaan koppii godhi."} };
const OR_TOOL_LABELS = { plan:"Karoora", write:"Barreessi", research:"Qorannoo", check:"Qulqullina" };
const OR_TOOL_DISPLAY = { plan:["Karoora tarsiimoo","Kaayyoo kee tarkaanfii ifa ta'etti jijjiiri","KAAYYOO IFATTI"], write:["Studio barreessuu","Barreeffama qulqulluu fi ogummaa qabu uumi","OGUMMAADHAAN IBSI"], research:["IDDOO QORANNOO","Mata-duree, filannoo fi carraa hubadhu","WANTA BARBAACHISAA BARADHU"], check:["Sakatta'a qulqullinaa","Hojii kee erguu dura fooyyessi","QULQULLINA OLAANAA"]};

const tools = [
  { id: "plan", label: "Strategic planner", short: "Plan", subtitle: "Turn ambitious goals into clear next steps", icon: Layers3, tint: "violet", eyebrow: "THINK WITH CLARITY", placeholder: "What are you trying to achieve? Share your goal, timeline, resources and constraints.", sample: "Build a practical 30-day plan to launch a beginner-friendly freelance writing service. Include weekly milestones, daily actions, free tools, risks and measurable outcomes." },
  { id: "write", label: "Content studio", short: "Write", subtitle: "Create thoughtful, polished communication", icon: PenLine, tint: "blue", eyebrow: "COMMUNICATE WITH IMPACT", placeholder: "What do you need to create? Include the audience, purpose, format and tone.", sample: "Write a compelling, professional proposal for a beginner applying for a remote blog-writing opportunity. Make it confident, specific and honest about my experience." },
  { id: "research", label: "Research desk", short: "Research", subtitle: "Understand topics, options and opportunities", icon: Microscope, tint: "amber", eyebrow: "DISCOVER WHAT MATTERS", placeholder: "What topic or question should we explore? Add your location, context or decision if relevant.", sample: "Research practical ways for a beginner in Ethiopia to find legitimate international remote freelance work. Explain where to look, eligibility, common scams and first steps. Clearly distinguish verified facts from general guidance." },
  { id: "check", label: "Quality review", short: "Review", subtitle: "Strengthen work before it goes out", icon: FileCheck2, tint: "green", eyebrow: "RAISE YOUR STANDARD", placeholder: "Paste the work you want reviewed. Tell us the audience and what a successful result should achieve.", sample: "Review the following text for clarity, grammar, tone, structure and persuasiveness. Give a concise assessment, identify specific weaknesses and provide an improved version:\\n\\n[Paste your text here]" }
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
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem(LANGUAGE_KEY) === "om" ? "om" : "en"; } catch { return "en"; } });
  const ui = UI_TEXT[language] || UI_TEXT.en;
  const toolDisplay = language === "om" ? OR_TOOL_DISPLAY[activeTool] : null;
  const toolLabels = language === "om" ? OR_TOOL_LABELS : null;
  const [history, setHistory] = useState(readHistory);
  const [healthCheckedAt, setHealthCheckedAt] = useState(null);

  const currentTool = useMemo(() => tools.find(item => item.id === activeTool) || tools[0], [activeTool]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    const requestedTool = params.get("tool");
    const allowedTools = ["plan", "write", "research", "check"];
    if (!topic) return;
    const selectedTool = allowedTools.includes(requestedTool) ? requestedTool : "plan";
    const prompts = {
      finance: { en: "Create a responsible YouTube content strategy about personal finance, budgeting, saving and beginner investing education. Include a 4-week calendar, 3 long-form video outlines, 5 Shorts ideas, audience profile, evidence-checking sources, risk disclosures and ethical monetization ideas. Do not promise returns or give personalized investment advice.", om: "Barnoota faayinaansii dhuunfaa, baajata, qusannaa fi invastimantii jalqabaa irratti tarsiimoo YouTube itti gaafatamummaa qabu qopheessi. Karoora torban 4, caasaa video dheeraa 3, yaada Shorts 5, daawwataa kaayyoo, madda mirkaneessaa, ibsa balaa fi mala galii naamusa qabu dabali. Bu'aa invastimantii hin waadaa galin; gorsa invastimantii dhuunfaa hin kennin." },
      technology: { en: "Create a practical YouTube channel plan about technology, software, AI tools, website building and cybersecurity awareness. Include beginner-friendly tutorials, a 4-week calendar, 3 long-form outlines, 5 Shorts, hands-on demonstrations, fact-checking and sponsorship disclosure guidance.", om: "Teeknooloojii, software, meeshaalee AI, ijaarsa website fi hubannoo cybersecurity irratti karoora channel YouTube qabatamaa qopheessi. Leenjii jalqabaa, karoora torban 4, caasaa video dheeraa 3, yaada Shorts 5, agarsiisa qabatamaa, mirkaneessa dhugaa fi ibsa sponsorship dabali." },
      education: { en: "Create an educational YouTube content plan for language learning, Excel, data skills, coding, communication and career development. Include learning outcomes, a 4-week publishing calendar, lesson outlines, practice tasks, 3 long-form ideas, 5 Shorts and ways to measure learner progress.", om: "Barumsa afaanii, Excel, dandeettii data, coding, qunnamtii fi guddina hojii irratti karoora qabiyyee YouTube qopheessi. Bu'aa barnootaa, karoora maxxansaa torban 4, caasaa barnootaa, shaakala, yaada video dheeraa 3, Shorts 5 fi guddina barataa ittiin madaalan dabali." },
      health: { en: "Create a safe, evidence-based YouTube education plan about general wellness, healthy routines and beginner fitness. Include a 4-week calendar, 3 long-form outlines, 5 Shorts, reputable medical source checks, safety disclaimers and clear boundaries against diagnosis or personalized treatment advice.", om: "Jireenya fayya-qabeessa, amala gaarii fi fitness jalqabaa irratti karoora barnoota YouTube nageenya qabu, ragaa irratti hundaa'e qopheessi. Karoora torban 4, caasaa video dheeraa 3, Shorts 5, madda yaalaa amanamaa, akeekkachiisa nageenyaa fi daangaa dhukkuba adda baasuu ykn yaala dhuunfaa kennuu irraa fagaachuu dabali." },
      property: { en: "Create a jurisdiction-aware YouTube education plan about real estate, home buying, renting, legal basics and insurance literacy. Include a 4-week calendar, 3 long-form outlines, 5 Shorts, official-source verification and disclaimers that laws and insurance terms vary by location.", om: "Qabeenya, mana bituu, kiraa, seera bu'uuraa fi hubannoo inshuraansii irratti karoora barnoota YouTube biyya/seera ilaallatu ibsu qopheessi. Karoora torban 4, caasaa video dheeraa 3, Shorts 5, madda mootummaa mirkaneessuu fi seerri akkasumas inshuraansiin bakka irratti akka garaagarummaa qabu ibsa dabali." },
      audience: { en: "Build a YouTube audience strategy focused on country, language, viewer needs and advertiser suitability. Explain CPM versus RPM accurately, propose ethical audience research, a 4-week experiment plan and Analytics metrics. Never recommend buying views or faking audience location, and do not guarantee earnings.", om: "Biyya, afaan, fedhii daawwataa fi mijataa beeksisaa irratti xiyyeeffachuun tarsiimoo daawwataa YouTube ijaari. CPM fi RPM sirriitti ibsi; qorannoo daawwataa naamusa qabu, karoora yaalii torban 4 fi safartuu Analytics dabali. View bituu ykn biyya daawwataa sobaan agarsiisuu hin gorsin; galii hin waadaa galin." },
      video: { en: "Create a YouTube publishing strategy comparing long-form videos and Shorts. Explain the 8-minute mid-roll eligibility rule without promising ad delivery, distinguish Shorts Feed monetization, and provide a 4-week plan with 3 long-form outlines, 8 Shorts ideas, repurposing workflow and performance metrics.", om: "Tarsiimoo maxxansaa YouTube video dheeraa fi Shorts wal bira qabu qopheessi. Ulaagaa daqiiqaa 8 mid-roll ibsi garuu beeksisni akka tajaajilu hin waadaa galin; galii Shorts Feed adda baasi; karoora torban 4, caasaa video dheeraa 3, yaada Shorts 8, mala qabiyyee irra deebi'anii fayyadamuu fi safartuu raawwii dabali." }
    };
    const selected = prompts[topic];
    if (!selected) return;
    setActiveTool(selectedTool);
    setView("workspace");
    setPrompt(selected[language] || selected.en);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);


  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => { try { localStorage.setItem(LANGUAGE_KEY, language); } catch {} }, [language]);

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
        setError(err.message || ui.genericError);
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
      if (err?.name !== "AbortError") setError(ui.shareError);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(ui.clipboardError);
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
      <a className="skip-link" href="#main-content">{ui.skip}</a>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <button className="brand" onClick={() => { setView("workspace"); setMobileNav(false); }} aria-label="FlowChera21 home">
          <span className="brand-mark"><Sparkles size={19}/></span>
          <span className="brand-name">FlowChera21<small>AI EARNING HUB</small></span>
          <span className="brand-version">AI</span>
        </button>

        <div className="nav-caption">{ui.nav}</div>
        <nav className="nav-list" aria-label={ui.navWorkspace}>
          <button className={`nav-item ${view === "workspace" ? "active" : ""}`} onClick={() => { setView("workspace"); setMobileNav(false); }}>
            <span className="nav-icon neutral"><Command size={17}/></span><span>{ui.workspace}</span><ChevronRight className="nav-chevron" size={15}/>
          </button>
          <button className={`nav-item ${view === "history" ? "active" : ""}`} onClick={() => { setView("history"); setMobileNav(false); }}>
            <span className="nav-icon neutral"><History size={17}/></span><span>{ui.activity}</span><span className="nav-count">{history.length}</span>
          </button>
        </nav>

        <div className="nav-caption tools-caption">{ui.capabilities}</div>
        <nav className="nav-list" aria-label={ui.navTools}>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return <button key={tool.id} className={`nav-item ${view === "workspace" && activeTool === tool.id ? "active" : ""}`} onClick={() => chooseTool(tool.id)}>
              <span className={`nav-icon ${tool.tint}`}><Icon size={17}/></span><span>{language === "om" ? ({ plan: "Karoora", write: "Barreessi", research: "Qorannoo", check: "Qulqullina" }[tool.id] || tool.short) : tool.short}</span>
              {view === "workspace" && activeTool === tool.id && <span className="active-dot"/>}
            </button>;
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <div className="promo-orb"><WandSparkles size={18}/></div>
            <span className="promo-label">{ui.promoLabel}</span>
            <strong>{ui.promoTitle}</strong>
            <p>{ui.promoDesc}</p>
            <div className="promo-foot"><span><Zap size={13}/> {ui.toolCountLabel}</span><span>{ui.freeAccess}</span></div>
          </div>
          <div className="sidebar-profile">
            <div className="profile-avatar">FC</div>
            <div className="profile-text"><strong>{ui.workspaceProfile}</strong><small>{ui.privateDevice}</small></div>
            <ShieldCheck size={17} className="profile-shield"/>
          </div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main className="main" id="main-content" tabIndex="-1">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label={ui.menuOpen}><Menu size={20}/></button>
            <div className="breadcrumb"><span>FlowChera21</span><b>/</b><strong>{view === "history" ? ui.activity : (toolLabels ? toolLabels[activeTool] : currentTool.short)}</strong></div>
          </div>
          <div className="topbar-right">
            <button className={`service-status ${apiStatus}`} onClick={checkHealth} title={ui.statusCheck} aria-label={ui.statusCheck} aria-live="polite">
              <span className="status-dot"/><span>{apiStatus === "checking" ? ui.statusChecking : apiStatus === "online" ? ui.statusOnline : apiStatus === "not_configured" ? ui.statusNotConfigured : ui.statusIssue}</span><RefreshCw size={13} className={apiStatus === "checking" ? "spin" : ""}/>
            </button>
            <span className="topbar-divider"/><select className="language-select" value={language} onChange={event => setLanguage(event.target.value)} aria-label="Select language"><option value="en">EN</option><option value="om">OM</option></select>
            <button className="icon-btn theme-btn" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <a className="topbar-link" href="https://onlineearninghub-ai.onrender.com/docs" target="_blank" rel="noreferrer">{ui.api} <ExternalLink size={13}/></a>
          </div>
        </header>

        <div className="content">
          {view === "workspace" ? (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-mark"/> {ui.heroEyebrow}</div>
                  <h1>{ui.heroTitleA}<br/><span>{ui.heroTitleB}</span></h1>
                  <p className="hero-description">{ui.heroDesc}</p>
                  <div className="hero-proof"><span><CheckCircle2 size={15}/> {ui.proofTools}</span><i/><span><Globe2 size={15}/> {ui.proofEveryone}</span><button type="button" className="share-site-btn" onClick={shareSite}><Share2 size={14}/> {ui.share}</button></div>
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

              <div className="section-heading"><div><span className="section-kicker">{ui.toolkit}</span><h2>{ui.toolkitTitle}</h2></div><span className="section-note">{ui.toolkitNote}</span></div>
              <section className="tool-grid" aria-label="Choose an AI tool">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return <button key={tool.id} className={`tool-card ${activeTool === tool.id ? "selected" : ""}`} onClick={() => chooseTool(tool.id)}>
                    <div className="tool-card-top"><span className={`tool-icon ${tool.tint}`}><Icon size={20}/></span><span className="tool-index">0{index + 1}</span></div>
                    <strong>{language === "om" ? OR_TOOL_DISPLAY[tool.id][0] : tool.label}</strong><p>{language === "om" ? OR_TOOL_DISPLAY[tool.id][1] : tool.subtitle}</p><span className="tool-open">{ui.cardOpen} <ArrowUpRight size={14}/></span>
                  </button>;
                })}
              </section>

              <section className="workspace-panel">
                <div className="panel-heading">
                  <div className={`panel-tool-icon ${currentTool.tint}`}><currentTool.icon size={20}/></div>
                  <div className="panel-heading-copy"><span className="panel-kicker">{toolDisplay ? toolDisplay[2] : currentTool.eyebrow}</span><h2>{toolDisplay ? toolDisplay[0] : currentTool.label}</h2><p>{toolDisplay ? toolDisplay[1] : currentTool.subtitle}</p></div>
                  <div className="powered-label"><Sparkles size={13}/> {ui.aiAssisted}</div>
                </div>
                <form onSubmit={runTool}>
                  <label className="prompt-label" htmlFor="prompt">{ui.promptLabel}</label>
                  <div className="prompt-wrap">
                    <textarea id="prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={language === "om" ? UI_TEXT.om[({ plan:"placeholderPlan", write:"placeholderWrite", research:"placeholderResearch", check:"placeholderCheck" }[activeTool])] : currentTool.placeholder} rows={5} maxLength={10000} required />
                    <div className="prompt-footer"><span>{prompt.length.toLocaleString()} / 10,000</span><button type="button" className="sample-btn" onClick={() => { setPrompt(language === "om" ? UI_TEXT.om[({ plan:"samplePlan", write:"sampleWrite", research:"sampleResearch", check:"sampleCheck" }[activeTool])] : currentTool.sample); setError(""); }}>{ui.sampleBtn} <ArrowUpRight size={13}/></button></div>
                  </div>
                  <div className="form-bottom"><div className="privacy-note"><ShieldCheck size={15}/><span>{ui.privacy}</span></div>
                    <button className="generate-btn" type="submit" disabled={busy || !prompt.trim()}>{busy ? <><LoaderCircle size={17} className="spin"/> {ui.working}</> : <><Sparkles size={16}/> {ui.generate} <ArrowRight size={16}/></>}</button>
                  </div>
                </form>

                {busy && <div className="loading-state"><div className="loading-mark"><Sparkles size={21}/></div><strong>{ui.loadingTitle}</strong><span>{ui.loadingDesc}</span><div className="loading-track"><i/></div></div>}
                {error && <div className="error-box" role="alert"><span className="error-icon">!</span><div><strong>{ui.errorTitle}</strong><p>{error}</p><button type="button" onClick={() => { setError(""); }}>{ui.dismiss}</button></div></div>}
                {result && !busy && <div className="result-section">
                  <div className="result-heading"><div><div className="result-kicker"><CheckCircle2 size={14}/> {ui.responseReady}</div><h3>{ui.resultTitle}</h3></div><button type="button" className="copy-btn" onClick={() => copyText(result.text)}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? ui.copied : ui.copy}</button></div>
                  <div className="result-meta"><span><Sparkles size={13}/> {result.data.agent || currentTool.short}</span>{result.data.model_used && <span>{ui.modelLabel} {result.data.model_used}</span>}{typeof result.data.fallback_used === "boolean" && <span className={result.data.fallback_used ? "fallback-note" : "primary-note"}>{result.data.fallback_used ? ui.fallbackModel : ui.primaryModel}</span>}</div>
                  <article className="result-content" aria-live="polite">{result.text}</article>
                  {activeTool === "research" && result.data.warning && <div className="research-note"><Globe2 size={15}/> {result.data.warning}</div>}
                  {activeTool === "research" && Array.isArray(result.data.sources) && result.data.sources.length === 0 && !result.data.warning && <div className="research-note"><Globe2 size={15}/> {ui.researchNoSources}</div>}
                  {activeTool === "research" && Array.isArray(result.data.sources) && result.data.sources.some(source => (source?.url?.startsWith("https://") || source?.url?.startsWith("http://"))) && <div className="research-sources"><strong>{ui.sources}</strong>{result.data.sources.filter(source => (source?.url?.startsWith("https://") || source?.url?.startsWith("http://"))).map((source, index) => <a key={source.url || index} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}</div>}
                  <div className="result-actions"><button type="button" className="secondary-btn" onClick={() => { setResult(null); setPrompt(""); }}> <Plus size={14}/> {ui.newRequest}</button><span>{ui.verifyNote}</span></div>
                </div>}
              </section>

              <div className="bottom-note"><div className="bottom-note-icon"><ShieldCheck size={17}/></div><div><strong>{ui.bottomTitle}</strong><span>{ui.bottomDesc}</span></div><button type="button" onClick={() => setView("history")}>{ui.viewActivity} <ArrowRight size={14}/></button></div>
            </>
          ) : (
            <section className="history-page">
              <div className="eyebrow"><span className="eyebrow-mark"/> {ui.historyEyebrow}</div>
              <div className="history-title-row"><div><h1>{ui.historyTitle} <span>{ui.activity.toLowerCase()}.</span></h1><p className="hero-description">{ui.historyDesc}</p></div>{history.length > 0 && <button className="clear-history" onClick={clearHistory}><Trash2 size={15}/> {ui.clearHistory}</button>}</div>
              {history.length === 0 ? <div className="empty-history"><div className="empty-icon"><History size={25}/></div><h2>{ui.emptyTitle}</h2><p>{ui.emptyDesc}</p><button className="generate-btn" onClick={() => setView("workspace")}>{ui.goWorkspace} <ArrowRight size={15}/></button></div> :
                <div className="history-list">{history.map(item => <article className="history-item" key={item.id}><div className={`history-icon ${tools.find(tool => tool.id === item.toolId)?.tint || "violet"}`}>{(() => { const Icon = tools.find(tool => tool.id === item.toolId)?.icon || Sparkles; return <Icon size={18}/>; })()}</div><div className="history-copy"><div className="history-meta"><strong>{language === "om" ? (toolLabels[item.toolId] || item.toolLabel) : item.toolLabel}</strong><span>{new Date(item.createdAt).toLocaleString()}</span></div><p>{item.prompt}</p><span className="history-preview">{item.text.slice(0, 170)}{item.text.length > 170 ? "…" : ""}</span></div><button className="history-open" onClick={() => openHistoryItem(item)} aria-label="Open saved response"><ArrowUpRight size={17}/></button></article>)}</div>}
            </section>
          )}

          <footer className="footer"><span>© {new Date().getFullYear()} FlowChera21 · AI Earning Hub</span><span className="footer-links"><a href="/learn.html">{language === "om" ? "Barnoota" : "Learn"}</a><a href="/about.html">{language === "om" ? "Waa'ee" : "About"}</a><a href="/privacy.html">{language === "om" ? "Dhuunfaa" : "Privacy"}</a><a href="/terms.html">{language === "om" ? "Seera" : "Terms"}</a><a href="https://onlineearninghub-ai.onrender.com/docs" target="_blank" rel="noreferrer">{ui.api}</a></span><span><i/> {ui.footerIndependent} <b>·</b> {ui.footerDisclaimer}</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
