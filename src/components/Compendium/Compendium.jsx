import { useState, useMemo } from "react";
import { MONSTERS } from "../../data/monsters.js";
import { genId } from "../../store.js";

const CR_ORDER = ["0","1/8","1/4","1/2","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","30"];

function crNum(cr) {
  if (cr === "1/8") return 0.125;
  if (cr === "1/4") return 0.25;
  if (cr === "1/2") return 0.5;
  return parseFloat(cr) || 0;
}

function StatBlock({ monster, onAddToCombat, onEdit, onDelete, isCustom }) {
  const stats = ["STR","DEX","CON","INT","WIS","CHA"];
  const vals = [monster.str,monster.dex,monster.con,monster.int,monster.wis,monster.cha];
  function mod(v) { const m = Math.floor(((v||10)-10)/2); return m >= 0 ? `+${m}` : `${m}`; }

  return (
    <div style={{ background:"#f5e6c8", border:"2px solid var(--br)", borderRadius:4,
      padding:14, fontFamily:"'IM Fell English',serif", color:"#1a0a00", maxWidth:480 }}>
      {/* Name */}
      <div style={{ borderBottom:"2px solid var(--cr)", paddingBottom:6, marginBottom:8 }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:16, color:"var(--cr)", lineHeight:1.2 }}>{monster.name}</div>
        <div style={{ fontSize:11, fontStyle:"italic", marginTop:2 }}>
          {monster.size} {monster.type}, {monster.alignment}
        </div>
      </div>

      {/* Core stats */}
      <div style={{ borderBottom:"1px solid var(--cr)", paddingBottom:6, marginBottom:6 }}>
        <div style={{ fontSize:11 }}><b>Armor Class</b> {monster.ac}{monster.acNote ? ` (${monster.acNote})` : ""}</div>
        <div style={{ fontSize:11 }}><b>Hit Points</b> {monster.hp} {monster.hpDice ? `(${monster.hpDice})` : ""}</div>
        <div style={{ fontSize:11 }}><b>Speed</b> {monster.speed}</div>
      </div>

      {/* Ability scores */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:4, textAlign:"center",
        borderBottom:"1px solid var(--cr)", paddingBottom:8, marginBottom:8 }}>
        {stats.map((s,i) => (
          <div key={s} style={{ background:"rgba(139,26,26,.07)", borderRadius:3, padding:"4px 2px" }}>
            <div style={{ fontSize:9, fontFamily:"'Cinzel',serif", letterSpacing:1, fontWeight:700 }}>{s}</div>
            <div style={{ fontSize:14, fontWeight:700 }}>{vals[i] || 10}</div>
            <div style={{ fontSize:10, color:"var(--cr)" }}>{mod(vals[i])}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{ borderBottom:"1px solid var(--cr)", paddingBottom:6, marginBottom:6, fontSize:11 }}>
        {monster.saves && <div><b>Saving Throws</b> {monster.saves}</div>}
        {monster.skills && <div><b>Skills</b> {monster.skills}</div>}
        {monster.dmgVuln && <div><b>Damage Vulnerabilities</b> {monster.dmgVuln}</div>}
        {monster.dmgResist && <div><b>Damage Resistances</b> {monster.dmgResist}</div>}
        {monster.dmgImmune && <div><b>Damage Immunities</b> {monster.dmgImmune}</div>}
        {monster.condImmune && <div><b>Condition Immunities</b> {monster.condImmune}</div>}
        {monster.senses && <div><b>Senses</b> {monster.senses}</div>}
        {monster.languages && <div><b>Languages</b> {monster.languages}</div>}
        <div><b>Challenge</b> {monster.cr} ({(monster.xp||0).toLocaleString()} XP)</div>
      </div>

      {/* Traits */}
      {(monster.traits||[]).length > 0 && (
        <div style={{ marginBottom:6 }}>
          {monster.traits.map((t,i) => (
            <div key={i} style={{ fontSize:11, marginBottom:3 }}>
              <i><b>{t.name}.</b></i> {t.desc}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {(monster.actions||[]).length > 0 && (
        <div style={{ marginBottom:6 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:"var(--cr)",
            borderBottom:"1px solid var(--cr)", paddingBottom:2, marginBottom:4, textTransform:"uppercase" }}>Actions</div>
          {monster.actions.map((a,i) => (
            <div key={i} style={{ fontSize:11, marginBottom:3 }}>
              <i><b>{a.name}.</b></i> {a.desc}
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {(monster.reactions||[]).length > 0 && (
        <div style={{ marginBottom:6 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:"var(--cr)",
            borderBottom:"1px solid var(--cr)", paddingBottom:2, marginBottom:4, textTransform:"uppercase" }}>Reactions</div>
          {monster.reactions.map((r,i) => (
            <div key={i} style={{ fontSize:11, marginBottom:3 }}>
              <i><b>{r.name}.</b></i> {r.desc}
            </div>
          ))}
        </div>
      )}

      {/* Legendary Actions */}
      {(monster.legendaryActions||[]).length > 0 && (
        <div style={{ marginBottom:6 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:"var(--cr)",
            borderBottom:"1px solid var(--cr)", paddingBottom:2, marginBottom:4, textTransform:"uppercase" }}>Legendary Actions</div>
          {monster.legendaryActions.map((a,i) => (
            <div key={i} style={{ fontSize:11, marginBottom:3 }}>
              <i><b>{a.name}.</b></i> {a.desc}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
        {onAddToCombat && (
          <button onClick={() => onAddToCombat(monster)}
            style={{ background:"rgba(139,26,26,.15)", border:"1px solid var(--cr)",
              color:"var(--cr)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
              fontSize:9, padding:"4px 12px", letterSpacing:.5 }}>
            ⚔ Add to Combat
          </button>
        )}
        {isCustom && onEdit && (
          <button onClick={() => onEdit(monster)}
            style={{ background:"rgba(200,149,42,.1)", border:"1px solid rgba(200,149,42,.4)",
              color:"var(--gold)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
              fontSize:9, padding:"4px 12px" }}>✏ Edit</button>
        )}
        {isCustom && onDelete && (
          <button onClick={() => onDelete(monster.id)}
            style={{ background:"none", border:"1px solid rgba(92,51,23,.4)",
              color:"var(--br)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
              fontSize:9, padding:"4px 12px" }}>✕ Delete</button>
        )}
      </div>
    </div>
  );
}

function EditMonsterModal({ monster, onSave, onClose }) {
  const [form, setForm] = useState(monster || {
    name:"", size:"Medium", type:"humanoid", alignment:"neutral",
    ac:10, hp:10, hpDice:"2d8+2", speed:"30 ft",
    str:10,dex:10,con:10,int:10,wis:10,cha:10,
    cr:"1", xp:200, senses:"passive Perception 10", languages:"Common",
    traits:[], actions:[], reactions:[], legendaryActions:[],
  });

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const iStyle = {
    background:"rgba(245,230,200,.05)", border:"1px solid rgba(92,51,23,.4)",
    borderRadius:3, color:"var(--vel)", fontFamily:"'IM Fell English',serif",
    fontSize:12, padding:"3px 7px", outline:"none", width:"100%",
  };
  const lStyle = { fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:1.5, color:"var(--br)", textTransform:"uppercase", marginBottom:2 };

  function addAction(arr, setArr) {
    const name = prompt("Action name:");
    if (!name) return;
    const desc = prompt("Action description:");
    setArr([...arr, { name, desc: desc || "" }]);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16, overflowY:"auto" }}>
      <div style={{ background:"#1a0a02", border:"2px solid var(--gold)", borderRadius:6,
        padding:20, width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", color:"var(--gold)", fontSize:14, marginBottom:14 }}>
          {monster ? "Edit" : "Create"} NPC / Monster
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <div style={lStyle}>Name</div>
            <input style={iStyle} value={form.name} onChange={e=>f("name",e.target.value)} />
          </div>
          {[["size","Size"],["type","Type"],["alignment","Alignment"]].map(([k,l]) => (
            <div key={k}>
              <div style={lStyle}>{l}</div>
              <input style={iStyle} value={form[k]} onChange={e=>f(k,e.target.value)} />
            </div>
          ))}
          {[["ac","AC"],["hp","HP"],["hpDice","HP Dice"],["speed","Speed"],["cr","CR"],["xp","XP"]].map(([k,l]) => (
            <div key={k}>
              <div style={lStyle}>{l}</div>
              <input style={iStyle} value={form[k]} onChange={e=>f(k,e.target.value)} />
            </div>
          ))}
          {["str","dex","con","int","wis","cha"].map(k => (
            <div key={k}>
              <div style={lStyle}>{k.toUpperCase()}</div>
              <input type="number" style={iStyle} value={form[k]} onChange={e=>f(k,+e.target.value)} />
            </div>
          ))}
          {[["senses","Senses"],["languages","Languages"],["saves","Saving Throws"],["skills","Skills"],["dmgResist","Dmg Resistances"],["dmgImmune","Dmg Immunities"],["condImmune","Condition Immunities"]].map(([k,l]) => (
            <div key={k} style={{ gridColumn:"1/-1" }}>
              <div style={lStyle}>{l}</div>
              <input style={iStyle} value={form[k]||""} onChange={e=>f(k,e.target.value)} />
            </div>
          ))}
        </div>

        {/* Traits / Actions quick-add */}
        {[["traits","Traits"],["actions","Actions"],["reactions","Reactions"]].map(([key,label]) => (
          <div key={key} style={{ marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={lStyle}>{label}</div>
              <button onClick={()=>{ const arr=form[key]||[]; const name=prompt(`${label} name:`); if(!name)return; const desc=prompt("Description:"); f(key,[...arr,{name,desc:desc||""}]); }}
                style={{ background:"none", border:"1px solid rgba(200,149,42,.4)", color:"var(--gold)", borderRadius:3, cursor:"pointer", fontSize:9, padding:"1px 8px" }}>+ Add</button>
            </div>
            {(form[key]||[]).map((item,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                background:"rgba(245,230,200,.04)", border:"1px solid rgba(92,51,23,.3)", borderRadius:3, padding:"4px 8px", marginBottom:3 }}>
                <div style={{ fontSize:10, color:"var(--vel)" }}><b>{item.name}.</b> {item.desc}</div>
                <button onClick={()=>f(key,(form[key]||[]).filter((_,j)=>j!==i))}
                  style={{ background:"none", border:"none", color:"var(--br)", cursor:"pointer", fontSize:11, marginLeft:6, flexShrink:0 }}>✕</button>
              </div>
            ))}
          </div>
        ))}

        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16 }}>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(92,51,23,.5)",
            color:"var(--br)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10, padding:"6px 16px" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ ...form, id: form.id || genId(), source:"Custom" })}
            style={{ background:"var(--gold)", border:"none", color:"var(--ink)", borderRadius:3,
              cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:10, padding:"6px 20px", fontWeight:700 }}>
            ✦ Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Compendium({ customMonsters, onSaveCustom, onDeleteCustom, onAddToCombat }) {
  const [search, setSearch] = useState("");
  const [filterCR, setFilterCR] = useState("");
  const [filterType, setSearch2] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const allMonsters = useMemo(() => {
    return [
      ...MONSTERS,
      ...(customMonsters || []),
    ];
  }, [customMonsters]);

  const types = useMemo(() => [...new Set(allMonsters.map(m => m.type.split("(")[0].trim()))].sort(), [allMonsters]);

  const filtered = useMemo(() => {
    return allMonsters.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
          !m.type.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCR && m.cr !== filterCR) return false;
      if (filterType && !m.type.toLowerCase().includes(filterType.toLowerCase())) return false;
      if (filterSource === "srd" && m.source !== "SRD") return false;
      if (filterSource === "custom" && m.source !== "Custom") return false;
      return true;
    }).sort((a, b) => crNum(a.cr) - crNum(b.cr) || a.name.localeCompare(b.name));
  }, [allMonsters, search, filterCR, filterType, filterSource]);

  const iStyle = {
    background:"rgba(245,230,200,.05)", border:"1px solid rgba(92,51,23,.4)",
    borderRadius:3, color:"var(--vel)", fontFamily:"'IM Fell English',serif",
    fontSize:12, padding:"4px 9px", outline:"none",
  };

  return (
    <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
      {/* Left: list */}
      <div style={{ flex:1, minWidth:260 }}>
        {/* Toolbar */}
        <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
          <input style={{ ...iStyle, flex:1, minWidth:120 }} placeholder="🔍 Search monsters…"
            value={search} onChange={e=>setSearch(e.target.value)} />
          <select style={iStyle} value={filterCR} onChange={e=>setFilterCR(e.target.value)}>
            <option value="">All CR</option>
            {CR_ORDER.map(cr => <option key={cr} value={cr}>CR {cr}</option>)}
          </select>
          <select style={iStyle} value={filterSource} onChange={e=>setFilterSource(e.target.value)}>
            <option value="all">All Sources</option>
            <option value="srd">SRD</option>
            <option value="custom">Custom</option>
          </select>
          <button onClick={() => setShowCreate(true)}
            style={{ background:"rgba(200,149,42,.15)", border:"1px solid var(--gold)", color:"var(--gold)",
              borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:9, padding:"4px 12px", fontWeight:700 }}>
            + Create NPC
          </button>
        </div>

        {/* Monster list */}
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"30px", color:"rgba(245,230,200,.3)", fontStyle:"italic" }}>
              No monsters found.
            </div>
          )}
          {filtered.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px",
                background: selected?.id === m.id ? "rgba(200,149,42,.13)" : "rgba(26,10,2,.5)",
                border: `1px solid ${selected?.id === m.id ? "var(--gold)" : "rgba(92,51,23,.3)"}`,
                borderLeft: `3px solid ${m.source === "Custom" ? "var(--gold)" : "rgba(139,26,26,.5)"}`,
                borderRadius:3, cursor:"pointer", transition:"all .15s" }}>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:10, color:"var(--gold)",
                width:36, textAlign:"center", background:"rgba(200,149,42,.1)", borderRadius:3, padding:"2px 0", flexShrink:0 }}>
                {m.cr}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color: selected?.id===m.id ? "var(--gold)" : "var(--vel)",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.name}</div>
                <div style={{ fontSize:9, color:"rgba(245,230,200,.4)", fontFamily:"'IM Fell English',serif",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {m.size} {m.type}
                </div>
              </div>
              {m.source === "Custom" && (
                <span style={{ fontSize:8, color:"var(--gold)", fontFamily:"'Cinzel',serif",
                  background:"rgba(200,149,42,.15)", border:"1px solid rgba(200,149,42,.3)",
                  borderRadius:3, padding:"1px 5px", flexShrink:0 }}>Custom</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: stat block */}
      <div style={{ flex:1.5, minWidth:300 }}>
        {selected ? (
          <StatBlock
            monster={selected}
            onAddToCombat={onAddToCombat}
            isCustom={selected.source === "Custom"}
            onEdit={() => setEditing(selected)}
            onDelete={(id) => { onDeleteCustom(id); setSelected(null); }}
          />
        ) : (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(245,230,200,.2)",
            fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:14,
            border:"1px dashed rgba(92,51,23,.2)", borderRadius:4 }}>
            Select a monster to view its stat block
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreate || editing) && (
        <EditMonsterModal
          monster={editing}
          onSave={(m) => { onSaveCustom(m); setShowCreate(false); setEditing(null); }}
          onClose={() => { setShowCreate(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
