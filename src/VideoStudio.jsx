import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clapperboard, Download, Film, Languages, Mic2, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "https://onlineearninghub-ai.onrender.com").replace(/\/+$/, "");
const RENDER_API = (import.meta.env.VITE_VIDEO_RENDER_API || "https://flowchera21-mp4-renderer.onrender.com").replace(/\/+$/, "");
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
  const [locale, setLocale] = useState(language);
  useEffect(() => { setLocale(language); }, [language]);
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
  const [audioFile, setAudioFile] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState("");
  const [renderedVideoName, setRenderedVideoName] = useState("");
  const labels = locale === "om" ? {
    eyebrow:"CREATIVE PRODUCTION WORKSPACE", heading:"FlowChera21 Video Studio", intro:"Qabiyyee kee karoora, script fi scene production qindaa'aa ta'etti jijjiiri.", back:"Iddoo hojii AI", project:"Maqaa pirojektii", topic:"Mata-duree viidiyoo", lang:"Afaan viidiyoo", format:"Gosa viidiyoo", long:"Viidiyoo dheeraa", short:"YouTube Shorts", voice:"Gosa sagalee", tone:"Akkaataa", scenes:"Scene storyboard", add:"Scene dabali", generate:"Script AI qopheessi", generating:"Script qopheessaa jira…", script:"Script fi narration", save:"Karoora kuusi", export:"Production brief buusi", delete:"Haqi", duration:"Sekondii", visual:"Mul'ata / camera", narration:"Narration", saved:"Karoora browser kana keessatti kuufameera.", generated:"Script AI qopheesseera. Sirrii ta'uu isaa gulaali.", warning:"Studio kun MP4 server renderer irratti uuma: scene, animation, subtitle fi sagalee MP3/WAV olkaa’ame. TTS Afaanota sadiif amma hin mirkanoofne; renderer bilisaa yeroo ammaa daqiiqaa 5 irratti daangeffameera.", failed:"Script AI hin milkoofne. Backend/quota sakatta'i; barruu harkaan gulaaluu dandeessa.", voiceGenerate:"Sagalee browser irraa preview godhi",voiceGenerating:"Sagalee qopheessaa jira…",voiceEnabled:"Sagalee bilisaa browser fayyadama; afaan irratti hundaa’a",voiceDisabled:"Sagalee bilisaa browser fayyadama; afaan irratti hundaa’a",voiceGenerated:"Kun playback preview qofa; faayila sagalee hin uumu. Sagalee video irratti dabaluuf MP3/WAV galchi.",voiceTooLong:"Barruu sagalee kutaa 4,000 character gadiitti qoodi.",voiceFailure:"Sagalee uumuu hin dandeenye: ",renderVideo:"MP4 video oomishi",downloadMP4:"MP4 buufadhu",renderingVideo:"Video qopheessaa jira…",renderDone:"Video qophaa’eera; buufadhu.",renderUnsupported:"MP4 server renderer hin argamne. Irra deebi’ii yaali.",renderLimit:"Renderer bilisaa yeroo ammaa daqiiqaa 5 qofa deeggera; scenes gabaabsi.",voices:["Dubartii ga'eettii","Dhiira ga'eessa","Dargaggeessa","Jaarsa / dubartii jaartii","Sagalee daa'ima (gahee gabaabaa, nageenya qabu)"], tones:["Cinematic","Barnoota","Action / technology","Documentary","Professional"]} : locale === "am" ? {
    eyebrow:"የፈጠራ ሥራ ቦታ", heading:"FlowChera21 ቪዲዮ ስቱዲዮ", intro:"ሀሳብዎን ወደ የተደራጀ የቪዲዮ እቅድ፣ ስክሪፕት እና የትዕይንት ዝርዝር ይቀይሩ።", back:"AI የሥራ ቦታ", project:"የፕሮጀክት ርዕስ", topic:"የቪዲዮ ርዕስ", lang:"የቪዲዮ ቋንቋ", format:"የቪዲዮ አይነት", long:"ረጅም ቪዲዮ", short:"YouTube Shorts", voice:"የድምፅ አይነት", tone:"የፈጠራ አቀራረብ", scenes:"የትዕይንት እቅድ", add:"ትዕይንት ጨምር", generate:"AI ስክሪፕት ፍጠር", generating:"ስክሪፕት በመዘጋጀት ላይ…", script:"ስክሪፕት እና ትረካ", save:"ፕሮጀክት አስቀምጥ", export:"የምርት እቅድ አውርድ", delete:"አስወግድ", duration:"ሰከንዶች", visual:"ምስል / ካሜራ", narration:"ትረካ", saved:"ፕሮጀክቱ በዚህ ብራውዘር ውስጥ ተቀምጧል።", generated:"AI ስክሪፕት አዘጋጅቷል። ከማምረት በፊት ይከልሱት።", warning:"ይህ ስቱዲዮ በሰርቨር MP4፣ ትዕይንት፣ አኒሜሽን፣ ንዑስ ጽሑፍ እና MP3/WAV ድምፅ ያዘጋጃል። የAI ድምፅ ለሶስቱ ቋንቋዎች ገና አልተረጋገጠም፤ የbackground ሥራ አሁን እስከ60 ደቂቃ ይቀበላል፤ በነፃ hosting ላይ መጠናቀቁ ዋስትና የለውም።", failed:"AI ስክሪፕት ማዘጋጀት አልተሳካም። የአገልግሎቱን ሁኔታ ይፈትሹ።", voiceGenerate:"የአሳሽ ድምፅ ቅድመ እይታ",voiceGenerating:"ድምፅ በመዘጋጀት ላይ…",voiceEnabled:"ነፃ የአሳሽ ድምፅ ይጠቀማል፤ ቋንቋው በመሣሪያዎ ይወሰናል",voiceDisabled:"ነፃ የአሳሽ ድምፅ ይጠቀማል፤ ቋንቋው በመሣሪያዎ ይወሰናል",voiceGenerated:"ይህ የድምፅ ቅድመ እይታ ብቻ ነው፤ የድምፅ ፋይል አይፈጥርም። ድምፅ ለመጨመር MP3/WAV ይጫኑ።",voiceTooLong:"ጽሑፉን ከ4,000 ቁምፊዎች በታች በክፍል ይከፋፍሉ።",voiceFailure:"ድምፅ ማመንጨት አልተሳካም፦ ",renderVideo:"MP4 ቪዲዮ ፍጠር",downloadMP4:"MP4 አውርድ",renderingVideo:"ቪዲዮ በመዘጋጀት ላይ…",renderDone:"ቪዲዮዎ ዝግጁ ነው።",renderUnsupported:"ይህ ብራውዘር የቪዲዮ ቀረጻን አይደግፍም። Chrome ወይም Edge ይሞክሩ።",renderLimit:"የbackground ሥራ እስከ60 ደቂቃ ይቀበላል፤ ነፃ hosting ሊያቋርጠው ይችላል።",voices:["የጎልማሳ ሴት","የጎልማሳ ወንድ","ወጣት","አዛውንት","የሕፃን ድምፅ (አጭር እና ተስማሚ ሚና)"], tones:["ሲኒማዊ","ትምህርታዊ","አክሽን / ቴክኖሎጂ","ዘጋቢ ፊልም","ሙያዊ"]
  } : {
    eyebrow:"CREATIVE PRODUCTION WORKSPACE", heading:"FlowChera21 Video Studio", intro:"Turn your idea into a structured video plan, script and scene-by-scene production brief.", back:"AI workspace", project:"Project title", topic:"Video topic", lang:"Video language", format:"Video format", long:"Long-form video", short:"YouTube Shorts", voice:"Voice role", tone:"Creative direction", scenes:"Scene storyboard", add:"Add scene", generate:"Generate AI script", generating:"Writing your script…", script:"Script and narration", save:"Save project", export:"Export production brief", delete:"Remove", duration:"Seconds", visual:"Visual / camera", narration:"Narration", saved:"Project saved in this browser.", generated:"AI script generated. Review and edit it before production.", warning:"Create MP4 on the server with animated scenes, burned-in subtitles and uploaded MP3/WAV narration. AI speech for all three languages is not verified yet; the new background endpoint accepts up to 60 minutes, but free-hosting completion is not guaranteed.", failed:"AI script generation failed. Check backend availability/quota; you can still edit the script manually.", voiceGenerate:"Play browser narration preview",voiceGenerating:"Preparing narration…",voiceEnabled:"Uses free voices installed in your browser; language support depends on your device",voiceDisabled:"Uses free voices installed in your browser; language support depends on your device",voiceGenerated:"This is browser playback only; it does not create an audio file. Upload an MP3/WAV file to add narration to the video.",voiceTooLong:"Split narration into sections of 4,000 characters or fewer.",voiceFailure:"Voice generation failed: ",renderVideo:"Render MP4 video",downloadMP4:"Download MP4 video",renderingVideo:"Rendering video…",renderDone:"Your video is ready to download.",renderUnsupported:"The MP4 rendering server is unavailable. Please try again.",renderLimit:"The free renderer currently supports up to 5 minutes. Shorten the scenes.",voices:["Adult female","Adult male","Young adult","Older adult","Child voice (brief, age-appropriate role)"], tones:["Cinematic","Educational","Action / technology","Documentary","Professional"]};
  useEffect(() => {
    setVoiceReady(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
  }, []);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  useEffect(() => () => { if (renderedVideoUrl) URL.revokeObjectURL(renderedVideoUrl); }, [renderedVideoUrl]);
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
      "Project: " + title, "Topic: " + topic, "Write entirely in " + ({om:"Afaan Oromoo",en:"English",am:"Amharic (አማርኛ)"}[locale] || "English") + ". Keep all headings, narration, on-screen text and scene descriptions in that language.", "Format: " + format,
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
    if (!voiceReady) { setNotice(labels.renderUnsupported); return; }
    if (voice === "child-role") {
      setNotice("Child voice is a storyboard-only role. Choose an adult voice for browser narration.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narration);
    const localeTag = ({om:"om-ET", am:"am-ET", en:"en-US"})[locale] || "en-US";
    utterance.lang = localeTag;
    const available = window.speechSynthesis.getVoices();
    const languageVoices = available.filter(item => item.lang.toLowerCase().startsWith(localeTag.slice(0,2).toLowerCase()));
    if (languageVoices.length) {
      const female = /female|woman|zira|samantha|aria|jenny/i;
      const male = /male|man|david|guy|mark/i;
      const preferred = voice === "adult-male" ? languageVoices.find(item => male.test(item.name)) :
        voice === "adult-female" ? languageVoices.find(item => female.test(item.name)) : null;
      utterance.voice = preferred || languageVoices[0];
    }
    utterance.rate = voice === "young-adult" ? 1.04 : voice === "older-adult" ? 0.88 : 1;
    utterance.onstart = () => setNotice(locale === "om" ? "Sagalee bilisaa browser irraa dubbisaa jira. Afaan Oromoo irratti sagaleen meeshaa kee irratti jiraachuu isaa mirkaneessi." : locale === "am" ? "ነፃው የአሳሽ ድምፅ እያነበበ ነው። የቋንቋውን ድጋፍ በመሣሪያዎ ላይ ያረጋግጡ።" : "Playing a free voice installed in your browser. Language and accent availability depend on your device.");
    utterance.onerror = event => setNotice("Browser narration could not play: " + event.error);
    window.speechSynthesis.speak(utterance);
  };
  const renderVideo = async () => {
    if (rendering) return;
    const duration = scenes.reduce((sum, scene) => sum + Math.max(1, Number(scene.seconds) || 1), 0);
    if (duration > 3600) { setNotice(locale === "om" ? "Pirojektiin daqiiqaa 60 ol dha. Kutaa adda addaa keessatti oomishi." : locale === "am" ? "ፕሮጀክቱ ከ60 ደቂቃ በላይ ነው። በተለያዩ ክፍሎች ያመርቱ።" : "This best-effort free job endpoint currently accepts up to 60 minutes per project."); return; }
    if (scenes.some(scene => Number(scene.seconds) > 120)) { setNotice(locale === "om" ? "Scene tokko sekondii 120 caaluu hin qabu; scenes dabaluu dandeessa." : locale === "am" ? "አንድ ትዕይንት ከ120 ሰከንድ መብለጥ የለበትም።" : "Each scene must be 120 seconds or less. Add more scenes for longer videos."); return; }
    setRendering(true); setRenderProgress(1); setNotice("");
    try {
      const form = new FormData();
      form.append("project", JSON.stringify({title, locale, tone: tone === "action-technology" ? "action" : tone, scenes}));
      if (audioFile) form.append("audio", audioFile, audioFile.name);
      const response = await fetch(RENDER_API + "/jobs", {method:"POST", body:form});
      const created = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(created.detail || "Could not queue video production (" + response.status + ").");
      const jobId = created.job_id;
      if (!jobId || !created.status_url) throw new Error("Renderer returned an invalid job response.");
      setNotice(locale === "om" ? "Hojii viidiyoo jalqabsiifameera. Haala isaa hordofaa jira..." : locale === "am" ? "የቪዲዮ ሥራ ተጀምሯል፤ ሁኔታውን እየተከታተልን ነው..." : "Video job queued. Tracking background production progress…");
      const deadline = Date.now() + 4 * 60 * 60 * 1000;
      let job = null;
      while (Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        const statusResponse = await fetch(RENDER_API + created.status_url, {signal:AbortSignal.timeout(30000)});
        const statusData = await statusResponse.json().catch(() => ({}));
        if (!statusResponse.ok) throw new Error(statusData.detail || "Could not retrieve production status.");
        job = statusData;
        setRenderProgress(Math.max(2, Math.min(99, Number(job.progress) || 2)));
        setNotice((job.message || "Rendering") + " · " + (job.progress || 0) + "%");
        if (job.status === "completed") break;
        if (job.status === "failed") throw new Error(job.message || "Background video rendering failed.");
      }
      if (!job || job.status !== "completed") throw new Error("Video job is taking too long or its status is no longer available. Check the renderer before retrying.");
      const downloadUrl = RENDER_API + "/jobs/" + encodeURIComponent(jobId) + "/download";
      setRenderedVideoUrl(current => { if (current && current.startsWith("blob:")) URL.revokeObjectURL(current); return downloadUrl; });
      setRenderedVideoName("flowchera21-" + jobId + ".mp4");
      setRenderProgress(100);
      setNotice(locale === "om" ? "MP4 qophaa'eera. Amma MP4 buufadhu." : locale === "am" ? "MP4 ተዘጋጅቷል፤ አሁን ያውርዱ።" : "MP4 production completed. Select Download MP4 to save your file.");
    } catch(error) {
      setNotice((locale === "om" ? "MP4 oomishuun hin milkoofne: " : locale === "am" ? "MP4 ማዘጋጀት አልተሳካም፦ " : "MP4 production failed: ") + (error.message || "unknown error"));
    } finally { setRendering(false); }
  };
  const downloadRenderedVideo = () => {
    if (!renderedVideoUrl || !renderedVideoName) return;
    const link = document.createElement("a");
    link.href = renderedVideoUrl;
    link.download = renderedVideoName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const formatSrtTime = (seconds) => {
    const ms = Math.max(0, Math.round(seconds * 1000));
    const hh = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const mm = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const mmm = String(ms % 1000).padStart(3, "0");
    return hh + ":" + mm + ":" + ss + "," + mmm;
  };
  const exportSubtitles = () => {
    let cursor = 0;
    const entries = scenes.map((scene, index) => {
      const start = cursor;
      cursor += Math.max(1, Number(scene.seconds) || 1);
      const end = cursor;
      const text = String(scene.narration || "").trim();
      return text ? (index + 1) + "\n" + formatSrtTime(start) + " --> " + formatSrtTime(end) + "\n" + text : null;
    }).filter(Boolean);
    const blob = new Blob(["\uFEFF" + entries.join("\n\n") + "\n"], { type: "application/x-subrip;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flowchera21-subtitles-" + locale + ".srt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(locale === "om" ? "Subtitle SRT buufatameera." : locale === "am" ? "የSRT ንዑስ ጽሑፍ ወርዷል።" : "Subtitle file downloaded.");
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
        <div className="studio-actions"><button className="generate-btn" disabled={busy || !topic.trim()} onClick={generate}><Sparkles size={16}/>{busy ? labels.generating : labels.generate}</button><button className="secondary-btn" onClick={save}>{labels.save}</button></div>\n        <div className="studio-voice-tools"><button className="secondary-btn" disabled={!voiceReady || voiceBusy || !((script.trim()) || scenes.some(scene => scene.narration.trim())) || voice === "child-role"} onClick={generateVoice}><Mic2 size={16}/>{voiceBusy ? labels.voiceGenerating : labels.voiceGenerate}</button><span>{labels.voiceDisabled}</span></div>\n        <label className="studio-audio-upload">{locale === "om" ? "Sagalee MP3/WAV galchi" : locale === "am" ? "የMP3/WAV ትረካ ጨምር" : "Add narration audio (MP3/WAV)"}
          <input type="file" accept="audio/*" onChange={event => { const file=event.target.files?.[0]; if(file){ if(audioUrl) URL.revokeObjectURL(audioUrl); setAudioFile(file); setAudioUrl(URL.createObjectURL(file)); setNotice("Narration audio added to this video project."); } }} />
        </label>
        {audioUrl && <div className="studio-audio-preview"><audio controls src={audioUrl}/><a href={audioUrl} download="flowchera21-narration.mp3">Download audio</a><button type="button" className="secondary-btn" onClick={()=>{URL.revokeObjectURL(audioUrl);setAudioUrl("");setAudioFile(null);}}>Remove audio</button></div>}
        {notice && <p className="studio-notice" role="status">{notice}</p>}
      </section>
      <section className="studio-card">
        <div className="studio-section-head"><h2><Film size={18}/> {labels.scenes}</h2><strong>{Math.floor(totalSeconds/60)}:{String(totalSeconds%60).padStart(2,"0")}</strong></div>
        <div className="scene-list">{scenes.map((scene,index)=><article className="scene-card" key={index}>
          <div className="scene-card-head"><strong>SCENE {String(index+1).padStart(2,"0")}</strong><button type="button" aria-label={"Remove scene "+(index+1)} onClick={()=>setScenes(current=>current.filter((_,i)=>i!==index))} disabled={scenes.length===1}><Trash2 size={15}/></button></div>
          <label>Scene title<input value={scene.title} onChange={e=>updateScene(index,"title",e.target.value)}/></label>
          <div className="studio-two"><label>{labels.duration}<input type="number" min="1" max="120" value={scene.seconds} onChange={e=>updateScene(index,"seconds",e.target.value)}/></label><label>{labels.visual}<input value={scene.visual} onChange={e=>updateScene(index,"visual",e.target.value)}/></label></div>
          <label>{labels.narration}<textarea rows={2} value={scene.narration} onChange={e=>updateScene(index,"narration",e.target.value)}/></label>
        </article>)}</div>
        <div className="studio-render-tools"><button className="secondary-btn" type="button" onClick={exportSubtitles}>Download subtitles (.SRT)</button><button className="generate-btn" onClick={renderVideo} disabled={rendering || !scenes.length}><Film size={16}/>{rendering ? labels.renderingVideo+" "+renderProgress+"%" : labels.renderVideo}</button>{renderedVideoUrl && <button className="secondary-btn" type="button" onClick={downloadRenderedVideo}>{labels.downloadMP4}</button>}{rendering && <progress max="100" value={renderProgress}/>}</div><button className="secondary-btn studio-add" onClick={()=>setScenes(current=>[...current,{title:"New scene",seconds:20,visual:"Describe the shot",narration:"Write the narration"}])}><Plus size={15}/>{labels.add}</button>
      </section>
    </div>
    <section className="studio-card studio-script"><div className="studio-section-head"><h2><Mic2 size={18}/> {labels.script}</h2><span>{locale.toUpperCase()} · {voice}</span></div><textarea value={script} onChange={e=>{setScript(e.target.value);setSaved(false);}} rows={14} placeholder={om ? "Script AI'n uumame asitti mul'ata; yookaan harkaan barreessi..." : "Your generated script appears here, or write your own..."}/><div className="studio-actions"><button className="generate-btn" onClick={exportBrief}><Download size={16}/>{labels.export}</button><button className="secondary-btn" onClick={save}>{labels.save}</button>{onBack && <button className="secondary-btn" onClick={onBack}><ArrowLeft size={15}/>{labels.back}</button>}</div></section>
  </section>;
}
