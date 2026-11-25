import React from "react";
import { createRoot } from "react-dom/client";
import VideoStudio from "../src/VideoStudio.jsx";
import "../src/styles.css";
import "./standalone.css";
function Standalone() {
 const [language,setLanguage]=React.useState("en");
 return <div className="studio-standalone">
  <header className="standalone-header"><a href="https://www.flowchera21.bg5.net/" className="standalone-brand">FlowChera21 <span>VIDEO STUDIO</span></a><div><select aria-label="Interface language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en">English</option><option value="om">Afaan Oromoo</option></select><a href="https://www.flowchera21.bg5.net/">Main website ↗</a></div></header>
  <main><VideoStudio language={language}/></main>
  <footer className="standalone-footer">© {new Date().getFullYear()} FlowChera21 · Video production planning workspace · AI output should be reviewed before publication</footer>
 </div>;
}
createRoot(document.getElementById("root")).render(<React.StrictMode><Standalone/></React.StrictMode>);