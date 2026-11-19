import { useEffect, useState } from "react";
import { UserRound, LogIn, UserPlus, LogOut, History, MessageCircle, Star, Crown, ShieldCheck, RefreshCw, Send, Globe2, BarChart3, LoaderCircle } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "https://onlineearninghub-ai.onrender.com").replace(/\/+$/, "");
const TOKEN_KEY = "oeh-session-token";
const copy = {
  en: { account:"Account", signIn:"Sign in", register:"Create account", email:"Email address", password:"Password (12+ characters)", login:"Sign in", create:"Create account", verify:"Check your email and open the verification link before signing in.", dashboard:"Your dashboard", free:"Free plan", premium:"Premium", requests:"AI requests today", remaining:"Remaining today", total:"Total requests", history:"Your activity", chat:"AI chat", message:"Ask the AI assistant anything...", send:"Send", feedback:"Rate your experience", feedbackText:"Tell us what we can improve (optional)", submit:"Submit feedback", upgrade:"Upgrade to Premium", admin:"Admin overview", users:"Users", pageViews:"Page views (30 days)", logout:"Sign out", language:"Language", loading:"Please wait...", success:"Done", error:"Something went wrong.", noHistory:"Your saved AI activity will appear here.", verifyTitle:"Email verification", back:"Back to workspace", rating:"Your rating", premiumInfo:"Premium subscriptions are billed monthly through secure checkout.", plan:"Plan", verified:"Verified account", notVerified:"Email not verified", checkout:"Continue to secure checkout", chatTitle:"Chat with OnlineEarningHub AI", refresh:"Refresh dashboard" },
  om: { account:"Herrega", signIn:"Seeni", register:"Herrega uumi", email:"Teessoo imeelii", password:"Jecha iccitii (qubee 12+)", login:"Seeni", create:"Herrega uumi", verify:"Imeelii kee ilaali; seenuu dura linkii mirkaneessaa bani.", dashboard:"Daashboordii kee", free:"Karoora bilisaa", premium:"Premium", requests:"Gaaffii AI har'aa", remaining:"Kan hafe har'a", total:"Gaaffii waliigalaa", history:"Hojii kee", chat:"AI waliin haasa'i", message:"Gaaffii kee AI gaafadhu...", send:"Ergi", feedback:"Tajaajila madaali", feedbackText:"Maal fooyyessuu akka qabnu nutti himi (dirqama miti)", submit:"Yaada ergi", upgrade:"Gara Premium ce'i", admin:"Ilaalcha bulchaa", users:"Fayyadamtoota", pageViews:"Daawwannaa (guyyaa 30)", logout:"Ba'i", language:"Afaan", loading:"Mee eegi...", success:"Milkaa'e", error:"Rakkoon uumame.", noHistory:"Hojii AI kuufame asitti mul'ata.", verifyTitle:"Imeelii mirkaneessi", back:"Gara workspace deebi'i", rating:"Sadarkaa kenni", premiumInfo:"Premium ji'aan kaffaltii nageenya qabuun raawwatama.", plan:"Karoora", verified:"Herrega mirkanaa'e", notVerified:"Imeeliin hin mirkanoofne", checkout:"Gara kaffaltii nageenya qabuutti ce'i", chatTitle:"OnlineEarningHub AI waliin haasa'i", refresh:"Daashboordii haaromsi" },
  am: { account:"መለያ", signIn:"ግባ", register:"መለያ ፍጠር", email:"የኢሜይል አድራሻ", password:"የይለፍ ቃል (12+ ቁምፊዎች)", login:"ግባ", create:"መለያ ፍጠር", verify:"ኢሜይልዎን ይመልከቱና ከመግባትዎ በፊት የማረጋገጫ ሊንኩን ይክፈቱ።", dashboard:"የእርስዎ ዳሽቦርድ", free:"ነፃ እቅድ", premium:"ፕሪሚየም", requests:"የዛሬ AI ጥያቄዎች", remaining:"የቀሩት ዛሬ", total:"ጠቅላላ ጥያቄዎች", history:"እንቅስቃሴዎ", chat:"AI ውይይት", message:"AI ረዳቱን ማንኛውንም ነገር ይጠይቁ...", send:"ላክ", feedback:"ተሞክሮዎን ይገምግሙ", feedbackText:"ምን ማሻሻል እንደምንችል ይንገሩን (አማራጭ)", submit:"አስተያየት ላክ", upgrade:"ወደ ፕሪሚየም ያሳድጉ", admin:"የአስተዳዳሪ እይታ", users:"ተጠቃሚዎች", pageViews:"የገጽ እይታዎች (30 ቀናት)", logout:"ውጣ", language:"ቋንቋ", loading:"ቆይ እባክዎ...", success:"ተሳክቷል", error:"ችግር ተፈጥሯል።", noHistory:"የተቀመጡ የAI ስራዎችዎ እዚህ ይታያሉ።", verifyTitle:"ኢሜይል ያረጋግጡ", back:"ወደ ዋና ቦታ ተመለስ", rating:"ደረጃ ይስጡ", premiumInfo:"ፕሪሚየም በወር በደህንነቱ በተጠበቀ ክፍያ ይከፈላል።", plan:"እቅድ", verified:"የተረጋገጠ መለያ", notVerified:"ኢሜይል አልተረጋገጠም", checkout:"ወደ ደህንነቱ የተጠበቀ ክፍያ ይቀጥሉ", chatTitle:"ከ OnlineEarningHub AI ጋር ይወያዩ", refresh:"ዳሽቦርድ አድስ" }
};

export default function Account({ onClose }) {
  const [lang,setLang]=useState(()=>localStorage.getItem("oeh-language")||"en");
  const t=copy[lang]||copy.en;
  const [token,setToken]=useState(()=>sessionStorage.getItem(TOKEN_KEY)||"");
  const [user,setUser]=useState(null);
  const [dashboard,setDashboard]=useState(null);
  const [admin,setAdmin]=useState(null);
  const [adminUsers,setAdminUsers]=useState([]);
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [chat,setChat]=useState("");
  const [messages,setMessages]=useState([]);
  const [rating,setRating]=useState(5);
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");

  const call=async(path,options={})=>{
    const response=await fetch(API+path,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(options.headers||{})}});
    const data=await response.json().catch(()=>({detail:"Invalid server response"}));
    if(!response.ok) throw new Error(data.detail||"HTTP "+response.status);
    return data;
  };
  const refresh=async(currentToken=token)=>{
    if(!currentToken)return;
    try{
      const headers={Authorization:"Bearer "+currentToken};
      const readJson=async response=>{
        const data=await response.json().catch(()=>({detail:"Invalid server response"}));
        if(!response.ok){const err=new Error(data.detail||"HTTP "+response.status);err.status=response.status;throw err;}
        return data;
      };
      const [me,dash]=await Promise.all([
        fetch(API+"/me",{headers}).then(readJson),
        fetch(API+"/me/dashboard",{headers}).then(readJson)
      ]);
      setUser(me);setDashboard(dash);
      try{const a=await fetch(API+"/admin/analytics",{headers});if(a.ok){setAdmin(await a.json());const u=await fetch(API+"/admin/users",{headers});if(u.ok){const data=await u.json();setAdminUsers(data.users||[]);}}else{setAdmin(null);setAdminUsers([]);}}catch{setAdmin(null);setAdminUsers([]);}
    }catch(e){setError(e.message);if(e.status===401){setToken("");sessionStorage.removeItem(TOKEN_KEY);setUser(null);setDashboard(null);}}
  };
  useEffect(()=>{
    if(token)refresh(token);
    const params=new URLSearchParams(window.location.search);
    const verify=params.get("verify");
    if(verify){
      call("/auth/verify?token="+encodeURIComponent(verify),{method:"POST"}).then(()=>{setNotice("Email verified. Please sign in.");setMode("login");}).catch(e=>setError(e.message)).finally(()=>{params.delete("verify");const next=window.location.pathname+(params.toString()?"?"+params.toString():"");window.history.replaceState({},"",next);});
    }
  },[]);
  useEffect(()=>{localStorage.setItem("oeh-language",lang);window.dispatchEvent(new Event("oeh-language-change"));},[lang]);

  const submitAuth=async e=>{
    e.preventDefault();setBusy(true);setError("");setNotice("");
    try{
      const data=await call(mode==="register"?"/auth/register":"/auth/login",{method:"POST",body:JSON.stringify({email,password})});
      if(mode==="register"){setNotice(t.verify);setMode("login");setPassword("");}
      else{sessionStorage.setItem(TOKEN_KEY,data.access_token);setToken(data.access_token);setUser(data.user);await refresh(data.access_token);setPassword("");}
    }catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const logout=()=>{sessionStorage.removeItem(TOKEN_KEY);setToken("");setUser(null);setDashboard(null);setAdmin(null);setMessages([]);};
  const sendChat=async e=>{
    e.preventDefault();if(!chat.trim()||busy)return;
    const prompt=chat.trim();setChat("");setMessages(m=>[...m,{role:"user",text:prompt}]);setBusy(true);setError("");
    try{const data=await call("/chat",{method:"POST",body:JSON.stringify({message:prompt})});setMessages(m=>[...m,{role:"assistant",text:data.answer}]);await refresh();}
    catch(e){setError(e.message);setMessages(m=>[...m,{role:"assistant",text:e.message}]);}finally{setBusy(false);}
  };
  const sendFeedback=async e=>{
    e.preventDefault();setBusy(true);setError("");setNotice("");
    try{await call("/feedback",{method:"POST",body:JSON.stringify({rating,message:feedback})});setNotice("Thank you for your feedback.");setFeedback("");}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const checkout=async()=>{
    setBusy(true);setError("");
    try{const data=await call("/billing/checkout",{method:"POST"});window.location.assign(data.checkout_url);}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };

  return <section className="account-shell">
    <div className="account-head"><div><span className="account-eyebrow"><UserRound size={14}/> ONLINEEARNINGHUB AI</span><h2>{user?t.dashboard:t.account}</h2></div><div className="account-controls"><label><Globe2 size={14}/><select aria-label={t.language} value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="om">Afaan Oromo</option><option value="am">አማርኛ</option></select></label><button onClick={onClose}>{t.back}</button></div></div>
    {error&&<div className="account-alert error" role="alert">{error}</div>}{notice&&<div className="account-alert success">{notice}</div>}
    {!user?<div className="account-auth"><div className="account-tabs"><button className={mode==="login"?"selected":""} onClick={()=>setMode("login")}><LogIn size={15}/>{t.signIn}</button><button className={mode==="register"?"selected":""} onClick={()=>setMode("register")}><UserPlus size={15}/>{t.register}</button></div><form onSubmit={submitAuth}><label>{t.email}<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>{t.password}<input type="password" autoComplete={mode==="register"?"new-password":"current-password"} required minLength={mode==="register"?12:1} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="account-primary" disabled={busy}>{busy?<LoaderCircle className="account-spin" size={16}/>:mode==="register"?<UserPlus size={16}/>:<LogIn size={16}/>} {mode==="register"?t.create:t.login}</button></form><p className="account-hint">{mode==="register"?"Use at least 12 characters with letters and numbers. Email verification is required.":"Your account data is protected by server-side authentication."}</p></div>
    :<><div className="account-userbar"><div><strong>{user.email}</strong><small>{user.is_verified?t.verified:t.notVerified}</small></div><button onClick={logout}><LogOut size={15}/>{t.logout}</button></div>
    <div className="account-stats"><article><span>{t.plan}</span><strong>{user.plan==="premium"?t.premium:t.free}</strong></article><article><span>{t.requests}</span><strong>{dashboard?.usage?.today??"—"}</strong></article><article><span>{t.remaining}</span><strong>{dashboard?.usage?.remaining??"—"}</strong></article><article><span>{t.total}</span><strong>{dashboard?.usage?.total_requests??"—"}</strong></article></div>
    <div className="account-grid"><article className="account-card"><h3><History size={17}/>{t.history}</h3>{dashboard?.recent_activity?.length?dashboard.recent_activity.map(item=><div className="account-history" key={item.id}><strong>{item.tool}</strong><span>{new Date(item.created_at).toLocaleString()}</span><p>{item.prompt}</p><small>{item.answer.slice(0,180)}{item.answer.length>180?"…":""}</small></div>):<p>{t.noHistory}</p>}</article>
    <article className="account-card"><h3><MessageCircle size={17}/>{t.chatTitle}</h3><div className="account-chatlog">{messages.map((m,i)=><div className={"account-message "+m.role} key={i}>{m.text}</div>)}</div><form className="account-chatform" onSubmit={sendChat}><textarea value={chat} onChange={e=>setChat(e.target.value)} placeholder={t.message} maxLength={10000}/><button disabled={busy||!chat.trim()}><Send size={15}/>{t.send}</button></form></article>
    <article className="account-card"><h3><Star size={17}/>{t.feedback}</h3><form onSubmit={sendFeedback}><label>{t.rating}<select value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} / 5</option>)}</select></label><label><textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder={t.feedbackText} maxLength={2000}/></label><button className="account-primary" disabled={busy}>{t.submit}</button></form></article>
    {user.plan!=="premium"&&<article className="account-card premium-card"><h3><Crown size={17}/>{t.upgrade}</h3><p>{t.premiumInfo}</p><button className="account-primary" onClick={checkout} disabled={busy}>{t.checkout}</button></article>}
    {admin&&<article className="account-card admin-card"><h3><ShieldCheck size={17}/>{t.admin}</h3><div className="account-stats"><div><span>{t.users}</span><strong>{admin.users}</strong></div><div><span>{t.pageViews}</span><strong>{admin.page_views}</strong></div><div><span>AI requests (30d)</span><strong>{admin.ai_requests}</strong></div><div><span>Feedback</span><strong>{admin.feedback_count}</strong></div></div><div className="admin-user-list"><strong>Latest accounts</strong>{adminUsers.map(item=><div key={item.id}><span>{item.email}</span><small>{item.plan} · {item.verified?"verified":"unverified"}</small></div>)}</div></article>}
    </div><button className="account-refresh" onClick={()=>refresh()}><RefreshCw size={14}/>{t.refresh}</button></>}
  </section>;
}
