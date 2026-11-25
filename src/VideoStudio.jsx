import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clapperboard, Download, Film, Languages, Mic2, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "https://onlineearninghub-ai.onrender.com").replace(/\/+$/, "");
const KEY = "flowchera21-video-studio-v1";
const initialScenes = [
  { title: "Opening hook", seconds: 12, visual: "Cinematic establishing shot and title reveal", narration: "Start with a clear question that makes the audience curious." },
  { title: "The challenge", seconds: 35, visual: "Show the problem with simple on-screen examples", narration: "Explain the challenge and why it matters to the viewer." },
  { title: "The solution", seconds: 55, visual: "Demonstration, screen recording or animated explainer", narration: "Walk through the practical solution step by step." },
  { title: "Closing and call to action", seconds: 18, visual: "Recap, end card and next-step prompt", narration: "Summarize the key lesson and invite viewers to take one useful action." }
];

export default function VideoStudio({ language = "en", onBack, standalone = false }) {
  const om = language === "om";
  const [title, setTitle] = useState("FlowChera21 — Your next big idea");
  const [topic, setTopic] = useState("");
  const [locale, setLocale] = useState("om");
  const [format, setFormat] = useState("long");
  const [voice, setVoice] = useState("adult-female");
  const [tone, setTone] = useState("cinematic");
  const [scenes, setScenes] = useState(initialScenes);
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const labels = om ? {
    eyebrow:"CREATIVE PRODUCTION WORKSPACE", heading:"FlowChera21 Video Studio", intro:"Qabiyyee kee karoora, script fi scene production qindaa'aa ta'etti jijjiiri.", back:"Iddoo hojii AI", project:"Maqaa pirojektii", topic:"Mata-duree viidiyoo", lang:"Afaan viidiyoo", format:"Gosa viidiyoo", long:"Viidiyoo dheeraa", short:"YouTube Shorts", voice:"Gosa sagalee", tone:"Akkaataa", scenes:"Scene storyboard", add:"Scene dabali", generate:"Script AI qopheessi", generating:"Script qopheessaa jira…", script:"Script fi narration", save:"Karoora kuusi", export:"Production brief buusi", delete:"Haqi", duration:"Sekondii", visual:"Mul'ata / camera", narration:"Narration", saved:"Karoora browser kana keessatti kuufameera.", generated:"Script AI qopheesseera. Sirrii ta'uu isaa gulaali.", warning:"Studio kun amma script, storyboard fi production brief qopheessa. Sagalee AI, video rendering fi MP4 export automatic ta'uun hanga media-rendering backend walitti hidhamutti hin hojjetu.", failed:"Script AI hin milkoofne. Backend/quota sakatta'i; barruu harkaan gulaaluu dandeessa.", voiceGenerate:"Sagalee AI uumi",voiceGenerating:"Sagalee qopheessaa jira…",voiceEnabled:"Tajaajilli sagalee hojii irra jira",voiceDisabled:"Tajaajilli sagalee kaffaltii qabu hanga abbaa sirnichaa eeyyamutti cufameera",voiceGenerated:"Sagaleen uumameera. Maxxansuu dura dhaggeeffadhu; sagalee Afaan Oromoo mirkaneessi.",voiceTooLong:"Barruu sagalee kutaa 4,000 character gadiitti qoodi.",voiceFailure:"Sagalee uumuu hin dandeenye: ",voiceGenerate:"Generate AI narration",voiceGenerating:"Generating narration…",voiceEnabled:"Voice service is enabled",voiceDisabled:"Paid voice service is off until the site owner enables it",voiceGenerated:"Narration audio generated. Listen and review pronunciation before publishing.",voiceTooLong:"Split narration into sections of 4,000 characters or fewer.",voiceFailure:"Voice generation failed: ",voices:["Dubartii ga'eettii","Dhiira ga'eessa","Dargaggeessa","Jaarsa / dubartii jaartii","Sagalee daa'ima (gahee gabaabaa, nageenya qabu)"], tones:["Cinematic","Barnoota","Action / technology","Documentary","Professional"]} : {
    eyebrow:"CREATIVE PRODUCTION WORKSPACE", heading:"FlowChera21 Video Studio", intro:"Turn your idea into a structured video plan, script and scene-by-scene production brief.", back:"AI workspace", project:"Project title", topic:"Video topic", lang:"Video language", format:"Video format", long:"Long-form video", short:"YouTube Shorts", voice:"Voice role", tone:"Creative direction", scenes:"Scene storyboard", add:"Add scene", generate:"Generate AI script", generating:"Writing your script…", script:"Script and narration", save:"Save project", export:"Export production brief", delete:"Remove", duration:"Seconds", visual:"Visual / camera", narration:"Narration", saved:"Project saved in this browser.", generated:"AI script generated. Review and edit it before production.", warning:"This studio currently creates scripts, storyboards and production briefs. AI voice recording, video rendering and automatic MP4 export are not enabled until a media-rendering backend is connected.", failed:"AI script generation failed. Check backend availability/quota; you can still edit the script manually.", voices:["Adult female","Adult male","Young adult","Older adult","Child voice (brief, age-appropriate role)"], tones:["Cinematic","Educational","Action / technology","Documentary","Professional"]};
  useEffect(() => {
    let active = true;
    fetch(API + "/video/capabilities")
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active) setVoiceReady(Boolean(data?.voice_generation)); })
      .catch(() => { if (active) setVoiceReady(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  const totalSeconds = useMemo(() => scenes.reduce((sum, scene) => sum + Math.max(0, Number(scene.seconds) || 0), 0), [scenes]);
  useEffect(() => {
    try {
      const savedProject = JSON.parse(localStorage.getItem(KEY) || "null");
      if (savedProject) {
        setTitle(savedProject.title || title); setTopic(savedProject.topic || "");
        setLocale(savedProject.locale || "om"); setFormat(savedProject.format || "long");
        setVoice(savedProject.voice || "adult-female"); setTone(savedProject.tone || "cinematic");
        setScenes(Array.isArray(savedProject.scenes) && savedProject.scenes.length ? savedProject.scenes : initialScenes);
        setScript(savedProject.script || "");
      }
    } catch {}
  }, []);
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ title, topic, locale, format, voice, tone, scenes, script, updatedAt: new Date().toISOString() })); setSaved(true); setNotice(labels.saved); }
    catch { setNotice("Could not save in this browser."); }
  };
  const generate = async () => {
    if (!topic.trim() || busy) return;
    setBusy(true); setNotice("");
    const prompt = [
      "Create a production-ready video script and shot plan. Do not claim footage, audio or video has been rendered.",
      "Project: " + title, "Topic: " + topic, "Language: " + ({om:"Afaan Oromoo",en:"English",am:"Amharic"}[locale] || locale), "Format: " + format,
      "Voice role: " + voice, "Creative direction: " + tone,
      "Target duration seconds: " + totalSeconds,
      "Scene outline: " + scenes.map((s,i) => (i+1)+". "+s.title+" ("+s.seconds+"s), visual: "+s.visual+", narration: "+s.narration).join("\n"),
      "Provide scene timestamps, spoken narration, on-screen text, visual direction, sound design suggestions, transition notes and a final quality checklist. Use original fictional voices only; do not imitate a real person."
    ].join("\n");
    try {
      const response = await fetch(API + "/write", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({description:prompt}), signal:AbortSignal.timeout(90000) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "AI service unavailable");
      setScript(data.content || data.written_content || ""); setSaved(false); setNotice(labels.generated);
    } catch (error) { setNotice(labels.failed + " (" + (error.message || "network error") + ")"); }
    finally { setBusy(false); }
  };
  const generateVoice = async () => {
    const narration = (script.trim() || scenes.map((scene, index) => `Scene ${index + 1}. ${scene.narration}`).join("\\n\\n")).trim();
    if (!narration || voiceBusy) return;
    if (voice === "child-role") {
      setNotice("Child voice role is a storyboard-only choice. Select an adult narrator for generated audio.");
      return;
    }
    if (narration.length > 4000) {
      setNotice(labels.voiceTooLong);
      return;
    }
    setVoiceBusy(true); setNotice("");
    try {
      const response = await fetch(API + "/video/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narration, language: locale, voice_role: voice }),
        signal: AbortSignal.timeout(100000)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Voice generation is unavailable.");
      }
      const blob = await response.blob();
      if (!blob.size || !blob.type.includes("audio")) throw new Error("The voice service returned an invalid audio file.");
      setAudioUrl(current => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob); });
      setNotice(labels.voiceGenerated);
    } catch (error) { setNotice(labels.voiceFailure + (error.message || "network error")); }
    finally { setVoiceBusy(false); }
  };
  const updateScene = (index, key, value) => setScenes(current => current.map((scene,i) => i === index ? {...scene,[key]:value} : scene));
  const exportBrief = () => {
    const content = ["# "+title, "", "Topic: "+topic, "Language: "+locale, "Format: "+format, "Voice role: "+voice, "Direction: "+tone, "Target duration: "+totalSeconds+" seconds", "", "## Script", script || "(Script not generated yet)", "", "## Storyboard", ...scenes.flatMap((s,i)=>["### Scene "+(i+1)+": "+s.title, "Duration: "+s.seconds+" seconds", "Visual: "+s.visual, "Narration: "+s.narration, ""]) , "## Production status", labels.warning].join("\n");
    const blob = new Blob([content], {type:"text/markdown;charset=utf-8"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="flowchera21-video-production-brief.md"; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="video-studio">
    <div className="studio-hero"><div className="studio-orb"><Clapperboard size={28}/></div><div><span className="studio-kicker">{labels.eyebrow}</span><h1>{labels.heading}</h1><p>{labels.intro}</p></div>{!standalone && <a className="studio-external-link" href="https://flowchera21-video-studio.onrender.com/" target="_blank" rel="noreferrer">Open standalone website ↗</a>}</div>
    <div className="studio-warning" role="note"><Film size={18}/><span>{labels.warning}</span></div>
    <div className="studio-grid">
      <section className="studio-card studio-settings">
        <h2><WandSparkles size={18}/> Project setup</h2>
        <label>{labels.project}<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120}/></label>
        <label>{labels.topic}<textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={3} placeholder={om ? "Mata-duree fi ergaa ijoo viidiyoo kee..." : "Describe the subject and the key message..."}/></label>
        <div className="studio-two">
          <label>{labels.lang}<select value={locale} onChange={e=>setLocale(e.target.value)}><option value="om">Afaan Oromoo</option><option value="en">English</option><option value="am">አማርኛ</option></select></label>
          <label>{labels.format}<select value={format} onChange={e=>setFormat(e.target.value)}><option value="long">{labels.long}</option><option value="short">{labels.short}</option></select></label>
        </div>
        <label>{labels.voice}<select value={voice} onChange={e=>setVoice(e.target.value)}>{labels.voices.map((v,i)=><option key={i} value={["adult-female","adult-male","young-adult","older-adult","child-role"][i]}>{v}</option>)}</select></label>
        <label>{labels.tone}<select value={tone} onChange={e=>setTone(e.target.value)}>{labels.tones.map((v,i)=><option key={i} value={["cinematic","educational","action-technology","documentary","professional"][i]}>{v}</option>)}</select></label>
        <div className="studio-actions"><button className="generate-btn" disabled={busy || !topic.trim()} onClick={generate}><Sparkles size={16}/>{busy ? labels.generating : labels.generate}</button><button className="secondary-btn" onClick={save}>{labels.save}</button></div>\n        <div className="studio-voice-tools"><button className="secondary-btn" disabled={!voiceReady || voiceBusy || !((script.trim()) || scenes.some(scene => scene.narration.trim())) || voice === "child-role"} onClick={generateVoice}><Mic2 size={16}/>{voiceBusy ? labels.voiceGenerating : labels.voiceGenerate}</button><span>{voiceReady ? labels.voiceEnabled : labels.voiceDisabled}</span></div>\n        {audioUrl && <div className="studio-audio-preview"><audio controls src={audioUrl}/><a href={audioUrl} download="flowchera21-narration.mp3">Download MP3</a></div>}
        {notice && <p className="studio-notice" role="status">{notice}</p>}
      </section>
      <section className="studio-card">
        <div className="studio-section-head"><h2><Film size={18}/> {labels.scenes}</h2><strong>{Math.floor(totalSeconds/60)}:{String(totalSeconds%60).padStart(2,"0")}</strong></div>
        <div className="scene-list">{scenes.map((scene,index)=><article className="scene-card" key={index}>
          <div className="scene-card-head"><strong>SCENE {String(index+1).padStart(2,"0")}</strong><button type="button" aria-label={"Remove scene "+(index+1)} onClick={()=>setScenes(current=>current.filter((_,i)=>i!==index))} disabled={scenes.length===1}><Trash2 size={15}/></button></div>
          <label>Scene title<input value={scene.title} onChange={e=>updateScene(index,"title",e.target.value)}/></label>
          <div className="studio-two"><label>{labels.duration}<input type="number" min="1" max="3600" value={scene.seconds} onChange={e=>updateScene(index,"seconds",e.target.value)}/></label><label>{labels.visual}<input value={scene.visual} onChange={e=>updateScene(index,"visual",e.target.value)}/></label></div>
          <label>{labels.narration}<textarea rows={2} value={scene.narration} onChange={e=>updateScene(index,"narration",e.target.value)}/></label>
        </article>)}</div>
        <button className="secondary-btn studio-add" onClick={()=>setScenes(current=>[...current,{title:"New scene",seconds:20,visual:"Describe the shot",narration:"Write the narration"}])}><Plus size={15}/>{labels.add}</button>
      </section>
    </div>
    <section className="studio-card studio-script"><div className="studio-section-head"><h2><Mic2 size={18}/> {labels.script}</h2><span>{locale.toUpperCase()} · {voice}</span></div><textarea value={script} onChange={e=>{setScript(e.target.value);setSaved(false);}} rows={14} placeholder={om ? "Script AI'n uumame asitti mul'ata; yookaan harkaan barreessi..." : "Your generated script appears here, or write your own..."}/><div className="studio-actions"><button className="generate-btn" onClick={exportBrief}><Download size={16}/>{labels.export}</button><button className="secondary-btn" onClick={save}>{labels.save}</button>{onBack && <button className="secondary-btn" onClick={onBack}><ArrowLeft size={15}/>{labels.back}</button>}</div></section>
  </section>;
