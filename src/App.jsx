import { useState, useCallback, useEffect } from "react";
import { loadStore, saveStore, genId } from "./store.js";
import CampaignTracker from "./components/Campaign/CampaignTracker.jsx";
import CombatTracker from "./components/Combat/CombatTracker.jsx";
import Compendium from "./components/Compendium/Compendium.jsx";
import CharacterSheet from "./components/CharacterSheet/index.jsx";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#1a0a00;--vel:#f5e6c8;--vd:#e8d5a3;--vm:#eeddb5;--gold:#c8952a;--gl:#e8b84b;--cr:#8b1a1a;--crl:#b52222;--br:#5c3317;--brl:#7a4a20;--sh:rgba(26,10,0,.35);--parchment:#f5e6c8}
html,body{height:100%;background:#120600;font-family:'IM Fell English',Georgia,serif;color:var(--vel);min-height:100vh}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#1a0800}::-webkit-scrollbar-thumb{background:var(--br);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--brl)}
.dm-app{display:flex;flex-direction:column;min-height:100vh}
.dm-nav{background:linear-gradient(135deg,#0e0400,#1a0800);border-bottom:2px solid var(--gold);display:flex;align-items:center;gap:0;padding:0 16px;min-height:52px;flex-shrink:0;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(0,0,0,.6)}
.dm-logo{font-family:'UnifrakturMaguntia',cursive;color:var(--gold);font-size:22px;text-shadow:0 0 20px rgba(200,149,42,.5);margin-right:20px;white-space:nowrap;flex-shrink:0;line-height:1}
.dm-logo-sub{font-size:10px;font-family:'Cinzel',serif;color:rgba(200,149,42,.45);letter-spacing:2px;display:block;margin-top:1px;text-shadow:none}
.nav-tabs{display:flex;flex:1;overflow-x:auto}
.nav-tab{padding:14px 18px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;background:none;border:none;border-bottom:3px solid transparent;color:rgba(200,149,42,.45);cursor:pointer;text-transform:uppercase;transition:all .2s;white-space:nowrap;position:relative;top:2px;margin-bottom:-2px;display:flex;align-items:center;gap:6px}
.nav-tab:hover{color:var(--gold)}
.nav-tab.act{color:var(--gold);border-bottom-color:var(--gold);background:rgba(200,149,42,.06)}
.tab-icon{font-size:14px}
.nav-save{padding:6px 16px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;background:var(--gold);color:var(--ink);border:none;border-radius:3px;cursor:pointer;font-weight:700;text-transform:uppercase;transition:all .2s;white-space:nowrap;flex-shrink:0;margin-left:10px}
.nav-save:hover{background:var(--gl)}
.nav-save.flash{background:rgba(76,175,80,.85);color:#fff}
.dice-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:7px 14px;background:rgba(14,4,0,.8);border-bottom:1px solid rgba(92,51,23,.35);flex-shrink:0}
.die-btn{width:34px;height:34px;border-radius:4px;background:linear-gradient(135deg,rgba(92,51,23,.35),rgba(30,12,2,.6));border:1px solid rgba(200,149,42,.3);color:var(--gold);font-family:'Cinzel Decorative',serif;font-size:8px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
.die-btn:hover{background:rgba(200,149,42,.15);border-color:var(--gold);transform:translateY(-1px)}
.dice-result{font-family:'Cinzel Decorative',serif;font-size:20px;color:var(--gold);min-width:44px;text-align:center;text-shadow:0 0 14px rgba(200,149,42,.6)}
.dice-hist{font-family:'IM Fell English',serif;font-size:10px;color:rgba(245,230,200,.3);font-style:italic;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dm-content{flex:1;padding:16px;overflow-y:auto;background:#1a0800}
.sec-hdr{font-family:'Cinzel Decorative',serif;color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;text-align:center;padding:6px 0 12px;border-bottom:1px solid rgba(200,149,42,.2);margin-bottom:14px}
.sec-hdr::before,.sec-hdr::after{content:'✦';margin:0 8px;font-size:7px}
.sec-wrap{background:#1a0802;border-radius:4px;padding:14px}
@media(max-width:640px){
  .dm-content{padding:10px 8px 72px}
  .dm-logo-sub{display:none}
  .nav-tabs{position:fixed;bottom:0;left:0;right:0;z-index:100;background:#0e0400;border-top:2px solid rgba(200,149,42,.4);justify-content:space-around}
  .nav-tab{flex:1;text-align:center;flex-direction:column;gap:2px;border-bottom:none!important;border-top:3px solid transparent;top:0;padding:8px 4px 12px;font-size:7px}
  .nav-tab.act{border-top-color:var(--gold);border-bottom:none!important}
  .tab-icon{font-size:20px}
  .dm-nav{padding:0 10px}
  .nav-save{font-size:8px;padding:4px 10px}
  .dice-bar{padding:5px 8px;gap:4px}
  .die-btn{width:30px;height:30px;font-size:7px}
}
`;

const DICE = [4, 6, 8, 10, 12, 20, 100];

function DiceBar() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [mod, setMod] = useState(0);

  function roll(sides) {
    const raw = Math.floor(Math.random() * sides) + 1;
    const total = raw + mod;
    const label = mod ? `d${sides}${mod>=0?"+":""}${mod}=${total}` : `d${sides}=${total}`;
    setResult({ total, raw, sides });
    setHistory(h => [label, ...h.slice(0, 7)]);
  }

  const isCrit = result?.raw === result?.sides;
  const isFumble = result?.raw === 1 && result?.sides === 20;

  return (
    <div className="dice-bar">
      <span style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1.5,color:"rgba(200,149,42,.4)",textTransform:"uppercase",flexShrink:0}}>Roll</span>
      {DICE.map(d => <button key={d} className="die-btn" onClick={() => roll(d)} title={`Roll d${d}`}>d{d}</button>)}
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <span style={{fontSize:8,color:"rgba(200,149,42,.4)",fontFamily:"'Cinzel',serif"}}>Mod</span>
        <input type="number" value={mod} onChange={e=>setMod(+e.target.value||0)}
          style={{width:34,background:"rgba(200,149,42,.08)",border:"1px solid rgba(200,149,42,.2)",borderRadius:3,color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:11,padding:"2px 4px",outline:"none",textAlign:"center"}} />
      </div>
      {result && (
        <div className="dice-result" style={{color: isCrit?"#ffd700":isFumble?"#ff5555":"var(--gold)"}}>
          {result.total}{isCrit?"✨":isFumble?"💀":""}
        </div>
      )}
      {history.length > 0 && <div className="dice-hist">{history.join(" · ")}</div>}
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(() => loadStore());
  const [tab, setTab] = useState("characters");
  const [savedFlash, setSavedFlash] = useState(false);
  const [pendingCombatant, setPendingCombatant] = useState(null);

  useEffect(() => {
    const t = setInterval(() => saveStore(store), 30000);
    return () => clearInterval(t);
  }, [store]);

  function save() {
    saveStore(store);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  const updStore = useCallback((key, value) => setStore(s => ({ ...s, [key]: value })), []);

  // Characters
  const handleCharsChange = useCallback(chars => updStore("characters", chars), [updStore]);

  // Campaigns
  const saveCampaign = useCallback(c => setStore(s => {
    const idx = s.campaigns.findIndex(x => x.id === c.id);
    return { ...s, campaigns: idx >= 0 ? s.campaigns.map(x => x.id===c.id ? c : x) : [...s.campaigns, c] };
  }), []);
  const deleteCampaign = useCallback(id => setStore(s => ({
    ...s, campaigns: s.campaigns.filter(c => c.id !== id), sessions: s.sessions.filter(s2 => s2.campaignId !== id)
  })), []);

  // Sessions
  const saveSession = useCallback(sess => setStore(s => {
    const idx = s.sessions.findIndex(x => x.id === sess.id);
    return { ...s, sessions: idx >= 0 ? s.sessions.map(x => x.id===sess.id ? sess : x) : [...s.sessions, sess] };
  }), []);
  const deleteSession = useCallback(id => setStore(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) })), []);

  // Custom monsters
  const saveCustomMonster = useCallback(m => setStore(s => {
    const idx = s.customMonsters.findIndex(x => x.id === m.id);
    return { ...s, customMonsters: idx >= 0 ? s.customMonsters.map(x => x.id===m.id ? m : x) : [...s.customMonsters, m] };
  }), []);
  const deleteCustomMonster = useCallback(id => setStore(s => ({ ...s, customMonsters: s.customMonsters.filter(x => x.id !== id) })), []);

  // Send monster to combat
  const addToCombat = useCallback(monster => {
    setPendingCombatant(monster);
    setTab("combat");
  }, []);

  const TABS = [
    { id:"characters", label:"Characters", icon:"⚔" },
    { id:"campaign",   label:"Campaign",   icon:"📜" },
    { id:"combat",     label:"Combat",     icon:"🛡" },
    { id:"compendium", label:"Compendium", icon:"📖" },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="dm-app">
        <nav className="dm-nav">
          <div className="dm-logo">
            ⚔ DM Forge
            <span className="dm-logo-sub">Dungeon Master Toolkit</span>
          </div>
          <div className="nav-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`nav-tab${tab===t.id?" act":""}`} onClick={() => setTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <button className={`nav-save${savedFlash?" flash":""}`} onClick={save}>
            {savedFlash ? "✓ Saved" : "✦ Save"}
          </button>
        </nav>

        <DiceBar />

        <main className="dm-content">
          {tab === "characters" && (
            <CharacterSheet characters={store.characters} onChange={handleCharsChange} />
          )}

          {tab === "campaign" && (
            <div className="sec-wrap">
              <div className="sec-hdr">Campaign Tracker</div>
              <CampaignTracker
                campaigns={store.campaigns}
                sessions={store.sessions}
                onSaveCampaign={saveCampaign}
                onDeleteCampaign={deleteCampaign}
                onSaveSession={saveSession}
                onDeleteSession={deleteSession}
              />
            </div>
          )}

          {tab === "combat" && (
            <div className="sec-wrap">
              <div className="sec-hdr">Combat Tracker</div>
              <CombatTracker
                characters={store.characters}
                pendingCombatant={pendingCombatant}
                onClearPending={() => setPendingCombatant(null)}
              />
            </div>
          )}

          {tab === "compendium" && (
            <div className="sec-wrap">
              <div className="sec-hdr">Monster Compendium</div>
              <Compendium
                customMonsters={store.customMonsters}
                onSaveCustom={saveCustomMonster}
                onDeleteCustom={deleteCustomMonster}
                onAddToCombat={addToCombat}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
