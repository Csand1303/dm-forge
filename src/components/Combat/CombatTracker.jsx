import { useState, useCallback, useEffect } from "react";
import { genId } from "../../store.js";
import { CONDITIONS } from "../../data/monsters.js";

const COND_MAP = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

function roll(sides) { return Math.floor(Math.random() * sides) + 1; }
function rollInitiative(dexMod) { return roll(20) + dexMod; }
function abMod(score) { return Math.floor(((score || 10) - 10) / 2); }

function ConditionPip({ condId, onRemove }) {
  const c = COND_MAP[condId];
  if (!c) return null;
  return (
    <span title={`${c.name}: ${c.desc}`} onClick={onRemove}
      style={{ display:"inline-flex", alignItems:"center", gap:2, background:c.color+"33",
        border:`1px solid ${c.color}`, borderRadius:3, padding:"1px 5px", fontSize:9,
        cursor:"pointer", color:c.color, fontFamily:"'Cinzel',serif", letterSpacing:.5,
        transition:"opacity .15s" }}
      onMouseEnter={e=>e.currentTarget.style.opacity=".6"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}
    >
      {c.icon} {c.name} ✕
    </span>
  );
}

function CombatantRow({ combatant, isActive, index, onUpdate, onRemove, onMoveUp, onMoveDown, totalCount }) {
  const [editing, setEditing] = useState(false);
  const [dmgInput, setDmgInput] = useState("");
  const [healInput, setHealInput] = useState("");
  const [showCondPicker, setShowCondPicker] = useState(false);

  const hpPct = combatant.hpMax > 0 ? Math.max(0, Math.min(1, combatant.hp / combatant.hpMax)) : 1;
  const hpColor = hpPct > 0.5 ? "#4caf50" : hpPct > 0.25 ? "#e8a44b" : "#e84b4b";

  function applyDmg() {
    const n = parseInt(dmgInput);
    if (isNaN(n)) return;
    onUpdate({ hp: Math.max(0, combatant.hp - n) });
    setDmgInput("");
  }
  function applyHeal() {
    const n = parseInt(healInput);
    if (isNaN(n)) return;
    onUpdate({ hp: Math.min(combatant.hpMax, combatant.hp + n) });
    setHealInput("");
  }
  function addCondition(condId) {
    if ((combatant.conditions || []).includes(condId)) return;
    onUpdate({ conditions: [...(combatant.conditions || []), condId] });
    setShowCondPicker(false);
  }
  function removeCondition(condId) {
    onUpdate({ conditions: (combatant.conditions || []).filter(c => c !== condId) });
  }

  const isEnemy = combatant.type === "enemy";
  const isDead = combatant.hp <= 0;

  return (
    <div style={{
      background: isActive ? "rgba(200,149,42,.13)" : isDead ? "rgba(0,0,0,.3)" : "rgba(26,10,2,.6)",
      border: `1px solid ${isActive ? "var(--gold)" : isDead ? "rgba(139,26,26,.3)" : "rgba(92,51,23,.35)"}`,
      borderLeft: `4px solid ${isEnemy ? "#e84b4b" : "#4b9ee8"}`,
      borderRadius: 4, padding: "8px 10px", marginBottom: 6,
      opacity: isDead ? .5 : 1, transition: "all .2s",
      boxShadow: isActive ? "0 0 12px rgba(200,149,42,.25)" : "none",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        {/* Initiative badge */}
        <div style={{
          background: isActive ? "var(--gold)" : "rgba(200,149,42,.2)",
          color: isActive ? "var(--ink)" : "var(--gold)",
          fontFamily:"'Cinzel Decorative',serif", fontSize:15, fontWeight:700,
          width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center",
          justifyContent:"center", flexShrink:0, border:"2px solid rgba(200,149,42,.4)",
          cursor:"pointer",
        }} onClick={() => { const v = prompt("Change initiative:", combatant.initiative); if (v !== null && !isNaN(+v)) onUpdate({ initiative: +v }); }}>
          {combatant.initiative}
        </div>

        {/* Name & type */}
        <div style={{ flex:1, minWidth:100 }}>
          {editing ? (
            <input autoFocus value={combatant.name} onChange={e=>onUpdate({name:e.target.value})}
              onBlur={()=>setEditing(false)} onKeyDown={e=>e.key==="Enter"&&setEditing(false)}
              style={{ background:"transparent", border:"none", borderBottom:"1px solid var(--gold)",
                color:"var(--gold)", fontFamily:"'Cinzel',serif", fontSize:13, outline:"none", width:"100%" }} />
          ) : (
            <div onClick={()=>setEditing(true)} style={{ fontFamily:"'Cinzel',serif", fontSize:13,
              color: isDead ? "var(--br)" : isActive ? "var(--gold)" : "var(--vel)",
              cursor:"text", textDecoration: isDead ? "line-through" : "none" }}>
              {combatant.name}
              {combatant.isConcentrating && <span title="Concentrating" style={{marginLeft:5,fontSize:10}}>🔮</span>}
            </div>
          )}
          <div style={{ fontSize:9, color:"rgba(245,230,200,.35)", fontFamily:"'Cinzel',serif", letterSpacing:.5 }}>
            {combatant.type === "enemy" ? "Enemy" : "Ally"}{combatant.cr ? ` · CR ${combatant.cr}` : ""}{combatant.ac ? ` · AC ${combatant.ac}` : ""}
          </div>
        </div>

        {/* HP bar & controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end", minWidth:130 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, color: hpColor }}>
              {isDead ? "DEAD" : `${combatant.hp} / ${combatant.hpMax}`}
            </span>
            <span style={{ fontSize:9, color:"rgba(245,230,200,.35)" }}>HP</span>
          </div>
          <div style={{ width:130, height:5, background:"rgba(255,255,255,.1)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ width:`${hpPct*100}%`, height:"100%", background:hpColor, transition:"width .3s", borderRadius:3 }}/>
          </div>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <input value={dmgInput} onChange={e=>setDmgInput(e.target.value)} placeholder="dmg"
              onKeyDown={e=>e.key==="Enter"&&applyDmg()}
              style={{ width:40, background:"rgba(139,26,26,.2)", border:"1px solid rgba(139,26,26,.4)",
                borderRadius:3, color:"#ff8888", fontFamily:"'Cinzel',serif", fontSize:10,
                padding:"1px 4px", outline:"none", textAlign:"center" }} />
            <button onClick={applyDmg} style={{ background:"rgba(139,26,26,.35)", border:"1px solid rgba(139,26,26,.5)",
              color:"#ff8888", borderRadius:3, cursor:"pointer", fontSize:9, padding:"1px 6px", fontFamily:"'Cinzel',serif" }}>
              −HP
            </button>
            <input value={healInput} onChange={e=>setHealInput(e.target.value)} placeholder="heal"
              onKeyDown={e=>e.key==="Enter"&&applyHeal()}
              style={{ width:40, background:"rgba(76,175,80,.15)", border:"1px solid rgba(76,175,80,.35)",
                borderRadius:3, color:"#88ff88", fontFamily:"'Cinzel',serif", fontSize:10,
                padding:"1px 4px", outline:"none", textAlign:"center" }} />
            <button onClick={applyHeal} style={{ background:"rgba(76,175,80,.2)", border:"1px solid rgba(76,175,80,.4)",
              color:"#88ff88", borderRadius:3, cursor:"pointer", fontSize:9, padding:"1px 6px", fontFamily:"'Cinzel',serif" }}>
              +HP
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"center" }}>
          <div style={{ display:"flex", gap:3 }}>
            <button onClick={onMoveUp} disabled={index===0}
              style={{ background:"none", border:"1px solid rgba(200,149,42,.3)", borderRadius:3,
                color:"var(--gold)", cursor:"pointer", fontSize:10, padding:"0 5px", opacity:index===0?.3:1 }}>▲</button>
            <button onClick={onMoveDown} disabled={index===totalCount-1}
              style={{ background:"none", border:"1px solid rgba(200,149,42,.3)", borderRadius:3,
                color:"var(--gold)", cursor:"pointer", fontSize:10, padding:"0 5px", opacity:index===totalCount-1?.3:1 }}>▼</button>
            <button onClick={onRemove}
              style={{ background:"none", border:"1px solid rgba(139,26,26,.4)", borderRadius:3,
                color:"var(--cr)", cursor:"pointer", fontSize:10, padding:"0 5px" }}>✕</button>
          </div>
          <button onClick={()=>setShowCondPicker(!showCondPicker)}
            style={{ background:"rgba(200,149,42,.1)", border:"1px solid rgba(200,149,42,.3)",
              borderRadius:3, color:"var(--gold)", cursor:"pointer", fontSize:8, padding:"1px 6px",
              fontFamily:"'Cinzel',serif", letterSpacing:.5, width:"100%" }}>
            + Condition
          </button>
        </div>
      </div>

      {/* Conditions */}
      {(combatant.conditions || []).length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
          {combatant.conditions.map(c => (
            <ConditionPip key={c} condId={c} onRemove={() => removeCondition(c)} />
          ))}
        </div>
      )}

      {/* Condition picker */}
      {showCondPicker && (
        <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:4,
          background:"rgba(0,0,0,.4)", borderRadius:4, padding:8, border:"1px solid rgba(200,149,42,.2)" }}>
          {CONDITIONS.filter(c => !(combatant.conditions||[]).includes(c.id)).map(c => (
            <span key={c.id} onClick={() => addCondition(c.id)}
              title={c.desc}
              style={{ display:"inline-flex", alignItems:"center", gap:2,
                background:c.color+"22", border:`1px solid ${c.color}55`,
                borderRadius:3, padding:"1px 7px", fontSize:9, cursor:"pointer",
                color:c.color, fontFamily:"'Cinzel',serif", letterSpacing:.5,
                transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=c.color+"44"}
              onMouseLeave={e=>e.currentTarget.style.background=c.color+"22"}
            >
              {c.icon} {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCombatantModal({ characters, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("enemy");
  const [initiative, setInitiative] = useState("");
  const [hp, setHp] = useState("");
  const [hpMax, setHpMax] = useState("");
  const [ac, setAc] = useState("");
  const [cr, setCr] = useState("");
  const [count, setCount] = useState(1);

  function submit() {
    const base = {
      type, ac: ac ? +ac : 10, cr,
      conditions: [], isConcentrating: false,
    };
    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` ${i + 1}` : "";
      const initVal = initiative ? +initiative : roll(20) + (type === "ally" ? 0 : 0);
      const hpVal = hpMax ? +hpMax : hp ? +hp : 10;
      onAdd({
        ...base,
        id: genId(),
        name: (name || (type === "enemy" ? "Enemy" : "Ally")) + suffix,
        initiative: initVal,
        hp: hpVal,
        hpMax: hpVal,
      });
    }
    onClose();
  }

  function addFromCharacter(c) {
    const dex = c.abilities?.DEX || 10;
    const dexMod = abMod(dex);
    const init = rollInitiative(dexMod);
    onAdd({
      id: genId(),
      name: c.name || "Hero",
      type: "ally",
      initiative: init,
      hp: c.hp?.current || c.hp?.max || 10,
      hpMax: c.hp?.max || 10,
      ac: c.ac || 10,
      conditions: [],
      isConcentrating: false,
      charId: c.id,
    });
  }

  const iStyle = {
    background:"rgba(245,230,200,.05)", border:"1px solid rgba(92,51,23,.4)",
    borderRadius:3, color:"var(--vel)", fontFamily:"'IM Fell English',serif",
    fontSize:13, padding:"4px 8px", outline:"none", width:"100%",
  };
  const lStyle = {
    fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:1.5,
    color:"var(--br)", textTransform:"uppercase", marginBottom:3,
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#1a0a02", border:"2px solid var(--gold)", borderRadius:6,
        padding:20, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 8px 40px rgba(0,0,0,.8)" }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", color:"var(--gold)", fontSize:14,
          marginBottom:14, borderBottom:"1px solid rgba(200,149,42,.3)", paddingBottom:8 }}>
          Add Combatant
        </div>

        {/* From party */}
        {characters.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={lStyle}>Add from Party</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {characters.map(c => (
                <button key={c.id} onClick={() => { addFromCharacter(c); onClose(); }}
                  style={{ background:"rgba(75,158,232,.15)", border:"1px solid rgba(75,158,232,.4)",
                    borderRadius:3, color:"#88bbff", cursor:"pointer", fontFamily:"'Cinzel',serif",
                    fontSize:10, padding:"4px 10px", letterSpacing:.5 }}>
                  ⚔ {c.name || "Unnamed"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <div style={lStyle}>Name</div>
            <input style={iStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Goblin, Dragon, etc." />
          </div>
          <div>
            <div style={lStyle}>Type</div>
            <select style={iStyle} value={type} onChange={e=>setType(e.target.value)}>
              <option value="enemy">Enemy</option>
              <option value="ally">Ally</option>
            </select>
          </div>
          <div>
            <div style={lStyle}>Count</div>
            <input type="number" style={iStyle} value={count} min={1} max={20} onChange={e=>setCount(Math.max(1,+e.target.value))} />
          </div>
          <div>
            <div style={lStyle}>Initiative</div>
            <input type="number" style={iStyle} value={initiative} onChange={e=>setInitiative(e.target.value)} placeholder="Roll on Add" />
          </div>
          <div>
            <div style={lStyle}>Max HP</div>
            <input type="number" style={iStyle} value={hpMax} onChange={e=>setHpMax(e.target.value)} placeholder="e.g. 27" />
          </div>
          <div>
            <div style={lStyle}>AC</div>
            <input type="number" style={iStyle} value={ac} onChange={e=>setAc(e.target.value)} placeholder="e.g. 15" />
          </div>
          <div>
            <div style={lStyle}>CR (optional)</div>
            <input style={iStyle} value={cr} onChange={e=>setCr(e.target.value)} placeholder="e.g. 2" />
          </div>
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(92,51,23,.5)",
            color:"var(--br)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
            fontSize:10, padding:"6px 16px", letterSpacing:1 }}>
            Cancel
          </button>
          <button onClick={submit} style={{ background:"var(--gold)", border:"none",
            color:"var(--ink)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
            fontSize:10, padding:"6px 20px", fontWeight:700, letterSpacing:1 }}>
            ✦ Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CombatTracker({ characters, combat, onChange, pendingCombatant, onClearPending }) {
  const [showAdd, setShowAdd] = useState(false);
  const [round, setRound] = useState(combat?.round || 1);
  const [activeIdx, setActiveIdx] = useState(combat?.activeIdx || 0);
  const [combatants, setCombatants] = useState(combat?.combatants || []);
  const [log, setLog] = useState(combat?.log || []);

  // Auto-add monster from compendium
  useEffect(() => {
    if (!pendingCombatant) return;
    const hpVal = pendingCombatant.hp || 10;
    setCombatants(prev => [...prev, {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      name: pendingCombatant.name,
      type: "enemy",
      initiative: Math.floor(Math.random() * 20) + 1,
      hp: hpVal,
      hpMax: hpVal,
      ac: pendingCombatant.ac || 10,
      cr: pendingCombatant.cr || "",
      conditions: [],
      isConcentrating: false,
    }]);
    onClearPending?.();
  }, [pendingCombatant]);

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  function addLog(msg) {
    setLog(prev => [`Round ${round}: ${msg}`, ...prev.slice(0, 49)]);
  }

  function updateCombatant(id, patch) {
    setCombatants(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    if (patch.hp !== undefined) {
      const c = combatants.find(x => x.id === id);
      if (c) {
        const diff = patch.hp - c.hp;
        addLog(`${c.name}: ${diff < 0 ? `${Math.abs(diff)} damage` : `healed ${diff}`} → ${patch.hp}/${c.hpMax} HP`);
      }
    }
  }

  function removeCombatant(id) {
    setCombatants(prev => prev.filter(c => c.id !== id));
    if (activeIdx >= combatants.length - 1) setActiveIdx(0);
  }

  function nextTurn() {
    const alive = sorted.filter(c => c.hp > 0);
    if (alive.length === 0) return;
    const nextIdx = (activeIdx + 1) % sorted.length;
    if (nextIdx < activeIdx) {
      setRound(r => r + 1);
      addLog(`── Round ${round + 1} begins ──`);
    }
    setActiveIdx(nextIdx);
    addLog(`${sorted[nextIdx]?.name}'s turn`);
  }

  function resetCombat() {
    if (!confirm("Reset combat? This will clear all combatants and the log.")) return;
    setCombatants([]); setLog([]); setRound(1); setActiveIdx(0);
  }

  function moveCombatant(idx, dir) {
    const newList = [...combatants];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    [newList[idx], newList[targetIdx]] = [newList[targetIdx], newList[idx]];
    setCombatants(newList);
  }

  function rollAllInitiatives() {
    setCombatants(prev => prev.map(c => ({ ...c, initiative: roll(20) })));
    addLog("Rolled initiative for all combatants");
  }

  const enemies = sorted.filter(c => c.type === "enemy");
  const allies = sorted.filter(c => c.type === "ally");
  const totalXP = enemies.reduce((sum, c) => {
    const xpMap = {"0":10,"1/8":25,"1/4":50,"1/2":100,"1":200,"2":450,"3":700,"4":1100,"5":1800,"6":2300,"7":2900,"8":3900,"9":5000,"10":5900};
    return sum + (xpMap[c.cr] || 0);
  }, 0);

  return (
    <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
      {/* Main tracker */}
      <div style={{ flex:2, minWidth:300 }}>
        {/* Header bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", color:"var(--gold)", fontSize:13 }}>
            ⚔ Round {round}
          </div>
          {totalXP > 0 && (
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"rgba(200,149,42,.6)", letterSpacing:1 }}>
              {totalXP.toLocaleString()} XP
            </div>
          )}
          <div style={{ marginLeft:"auto", display:"flex", gap:6, flexWrap:"wrap" }}>
            <button onClick={rollAllInitiatives}
              style={{ background:"rgba(200,149,42,.1)", border:"1px solid rgba(200,149,42,.4)",
                color:"var(--gold)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
                fontSize:9, padding:"4px 10px", letterSpacing:.5 }}>🎲 Roll All</button>
            <button onClick={() => setShowAdd(true)}
              style={{ background:"rgba(200,149,42,.15)", border:"1px solid var(--gold)",
                color:"var(--gold)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
                fontSize:9, padding:"4px 12px", letterSpacing:.5, fontWeight:700 }}>+ Add</button>
            <button onClick={nextTurn}
              style={{ background:"var(--gold)", border:"none", color:"var(--ink)",
                borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
                fontSize:10, padding:"4px 14px", fontWeight:700, letterSpacing:.5 }}>Next Turn ▶</button>
            <button onClick={resetCombat}
              style={{ background:"rgba(139,26,26,.2)", border:"1px solid rgba(139,26,26,.4)",
                color:"var(--cr)", borderRadius:3, cursor:"pointer", fontFamily:"'Cinzel',serif",
                fontSize:9, padding:"4px 10px", letterSpacing:.5 }}>✕ Reset</button>
          </div>
        </div>

        {/* Combatant list */}
        {sorted.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(245,230,200,.3)",
            fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:14,
            border:"1px dashed rgba(92,51,23,.3)", borderRadius:4 }}>
            No combatants yet. Add enemies or party members to begin.
          </div>
        ) : (
          sorted.map((c, i) => (
            <CombatantRow
              key={c.id}
              combatant={c}
              isActive={i === activeIdx}
              index={i}
              totalCount={sorted.length}
              onUpdate={patch => updateCombatant(c.id, patch)}
              onRemove={() => removeCombatant(c.id)}
              onMoveUp={() => moveCombatant(i, -1)}
              onMoveDown={() => moveCombatant(i, 1)}
            />
          ))
        )}
      </div>

      {/* Sidebar: log + summary */}
      <div style={{ flex:1, minWidth:220, display:"flex", flexDirection:"column", gap:10 }}>
        {/* Combat summary */}
        {(enemies.length > 0 || allies.length > 0) && (
          <div style={{ background:"rgba(26,10,2,.7)", border:"1px solid rgba(92,51,23,.4)", borderRadius:4, padding:10 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:1.5, color:"var(--gold)", textTransform:"uppercase", marginBottom:8 }}>Summary</div>
            {allies.length > 0 && (
              <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:8, color:"#88bbff", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:3 }}>ALLIES ({allies.length})</div>
                {allies.map(c => (
                  <div key={c.id} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color: c.hp <= 0 ? "rgba(245,230,200,.3)" : "var(--vel)", fontFamily:"'Cinzel',serif", padding:"1px 0" }}>
                    <span style={{ textDecoration: c.hp <= 0 ? "line-through" : "none" }}>{c.name}</span>
                    <span style={{ color: c.hp / c.hpMax > .5 ? "#4caf50" : c.hp > 0 ? "#e8a44b" : "#e84b4b" }}>
                      {c.hp <= 0 ? "Down" : `${c.hp}/${c.hpMax}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {enemies.length > 0 && (
              <div>
                <div style={{ fontSize:8, color:"#ff8888", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:3 }}>ENEMIES ({enemies.length})</div>
                {enemies.map(c => (
                  <div key={c.id} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color: c.hp <= 0 ? "rgba(245,230,200,.3)" : "var(--vel)", fontFamily:"'Cinzel',serif", padding:"1px 0" }}>
                    <span style={{ textDecoration: c.hp <= 0 ? "line-through" : "none" }}>{c.name}</span>
                    <span style={{ color: c.hp <= 0 ? "#e84b4b" : "rgba(245,230,200,.5)" }}>
                      {c.hp <= 0 ? "Dead" : "···"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Combat log */}
        <div style={{ background:"rgba(26,10,2,.7)", border:"1px solid rgba(92,51,23,.4)", borderRadius:4, padding:10, flex:1 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:1.5, color:"var(--gold)", textTransform:"uppercase", marginBottom:8 }}>Combat Log</div>
          {log.length === 0 ? (
            <div style={{ fontSize:10, color:"rgba(245,230,200,.25)", fontStyle:"italic", fontFamily:"'IM Fell English',serif" }}>Events will appear here…</div>
          ) : (
            <div style={{ maxHeight:300, overflowY:"auto" }}>
              {log.map((entry, i) => (
                <div key={i} style={{ fontSize:10, color: i === 0 ? "var(--vel)" : "rgba(245,230,200,.45)",
                  fontFamily:"'IM Fell English',serif", padding:"2px 0",
                  borderBottom: i < log.length-1 ? "1px solid rgba(92,51,23,.15)" : "none" }}>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddCombatantModal
          characters={characters}
          onAdd={c => setCombatants(prev => [...prev, c])}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
