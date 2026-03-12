import { useState } from "react";
import { genId } from "../../store.js";

const STATUS_COLORS = {
  active: "#4caf50",
  paused: "#e8a44b",
  completed: "#888",
  planning: "#4b9ee8",
};

function CampaignCard({ campaign, sessions, isActive, onSelect, onDelete }) {
  const sessionCount = sessions.filter(s => s.campaignId === campaign.id).length;
  const lastSession = sessions
    .filter(s => s.campaignId === campaign.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div onClick={onSelect}
      style={{
        background: isActive ? "rgba(200,149,42,.13)" : "rgba(26,10,2,.6)",
        border: `1px solid ${isActive ? "var(--gold)" : "rgba(92,51,23,.35)"}`,
        borderLeft: `4px solid ${STATUS_COLORS[campaign.status] || "#888"}`,
        borderRadius: 4, padding: "10px 12px", cursor: "pointer",
        transition: "all .2s", marginBottom: 6, position: "relative",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: isActive ? "var(--gold)" : "var(--vel)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {campaign.name || "Unnamed Campaign"}
          </div>
          <div style={{ fontSize: 9, color: "rgba(245,230,200,.4)", fontFamily: "'Cinzel',serif",
            letterSpacing: .5, marginTop: 2, textTransform: "uppercase" }}>
            {campaign.system || "D&D 5e 2024"} · {sessionCount} session{sessionCount !== 1 ? "s" : ""}
          </div>
        </div>
        <span style={{ fontSize: 8, fontFamily: "'Cinzel',serif", letterSpacing: .5,
          background: STATUS_COLORS[campaign.status] + "22",
          border: `1px solid ${STATUS_COLORS[campaign.status]}55`,
          color: STATUS_COLORS[campaign.status], borderRadius: 3, padding: "1px 6px",
          textTransform: "uppercase", flexShrink: 0 }}>
          {campaign.status || "active"}
        </span>
      </div>
      {lastSession && (
        <div style={{ fontSize: 9, color: "rgba(245,230,200,.3)", marginTop: 4,
          fontFamily: "'IM Fell English',serif", fontStyle: "italic" }}>
          Last session: {lastSession.date}
        </div>
      )}
      <button onClick={e => { e.stopPropagation(); if (confirm("Delete campaign and all its sessions?")) onDelete(campaign.id); }}
        style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none",
          color: "rgba(139,26,26,.4)", cursor: "pointer", fontSize: 12, opacity: 0,
          transition: "opacity .2s", padding: "2px 4px" }}
        className="campaign-del">
        ✕
      </button>
    </div>
  );
}

function SessionForm({ campaignId, session, onSave, onCancel }) {
  const [form, setForm] = useState(session || {
    id: genId(), campaignId,
    title: "", date: new Date().toISOString().slice(0, 10),
    number: 1, synopsis: "", notes: "", npcsmet: "",
    locationsVisited: "", loot: "", xp: "", status: "completed",
  });

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const iStyle = {
    background: "rgba(245,230,200,.05)", border: "1px solid rgba(92,51,23,.4)",
    borderRadius: 3, color: "var(--vel)", fontFamily: "'IM Fell English',serif",
    fontSize: 12, padding: "4px 8px", outline: "none", width: "100%",
  };
  const taStyle = { ...iStyle, resize: "vertical", minHeight: 70, lineHeight: 1.5 };
  const lStyle = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1.5,
    color: "var(--br)", textTransform: "uppercase", marginBottom: 3 };

  return (
    <div style={{ background: "rgba(26,10,2,.8)", border: "2px solid var(--gold)",
      borderRadius: 6, padding: 16 }}>
      <div style={{ fontFamily: "'Cinzel Decorative',serif", color: "var(--gold)",
        fontSize: 13, marginBottom: 12 }}>
        {session ? "✏ Edit Session" : "✦ New Session"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <div style={lStyle}>Session Title</div>
          <input style={iStyle} value={form.title} onChange={e => f("title", e.target.value)}
            placeholder="The Caves of Chaos…" />
        </div>
        <div>
          <div style={lStyle}>Date</div>
          <input type="date" style={iStyle} value={form.date} onChange={e => f("date", e.target.value)} />
        </div>
        <div>
          <div style={lStyle}>XP Awarded</div>
          <input type="number" style={iStyle} value={form.xp} onChange={e => f("xp", e.target.value)} />
        </div>
        <div>
          <div style={lStyle}>Session #</div>
          <input type="number" style={iStyle} value={form.number} min={1}
            onChange={e => f("number", +e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          ["synopsis", "Session Synopsis", "What happened this session…"],
          ["notes", "DM Notes", "Private notes, foreshadowing, mistakes to avoid…"],
          ["npcsmet", "NPCs Encountered", "Names and brief descriptions…"],
          ["locationsVisited", "Locations Visited", "Places the party went…"],
          ["loot", "Loot & Rewards", "Gold, items, and other rewards…"],
        ].map(([key, label, placeholder]) => (
          <div key={key} style={{ gridColumn: key === "synopsis" || key === "notes" ? "1/-1" : "auto" }}>
            <div style={lStyle}>{label}</div>
            <textarea style={taStyle} value={form[key]} placeholder={placeholder}
              onChange={e => f(key, e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel}
          style={{ background: "none", border: "1px solid rgba(92,51,23,.5)",
            color: "var(--br)", borderRadius: 3, cursor: "pointer",
            fontFamily: "'Cinzel',serif", fontSize: 10, padding: "6px 16px" }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)}
          style={{ background: "var(--gold)", border: "none", color: "var(--ink)",
            borderRadius: 3, cursor: "pointer", fontFamily: "'Cinzel',serif",
            fontSize: 10, padding: "6px 20px", fontWeight: 700, letterSpacing: 1 }}>
          ✦ Save Session
        </button>
      </div>
    </div>
  );
}

function SessionCard({ session, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const fields = [
    ["Synopsis", session.synopsis],
    ["DM Notes", session.notes],
    ["NPCs Met", session.npcsmet],
    ["Locations", session.locationsVisited],
    ["Loot", session.loot],
  ].filter(([, v]) => v);

  return (
    <div style={{ background: "rgba(26,10,2,.5)", border: "1px solid rgba(92,51,23,.35)",
      borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
      <div onClick={() => setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer" }}>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 12, color: "var(--gold)",
          width: 28, height: 28, borderRadius: "50%", background: "rgba(200,149,42,.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          border: "1px solid rgba(200,149,42,.3)" }}>
          {session.number}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "var(--vel)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {session.title || `Session ${session.number}`}
          </div>
          <div style={{ fontSize: 9, color: "rgba(245,230,200,.35)", fontFamily: "'Cinzel',serif" }}>
            {session.date}{session.xp ? ` · ${Number(session.xp).toLocaleString()} XP` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{ background: "none", border: "1px solid rgba(200,149,42,.3)", color: "rgba(200,149,42,.6)",
              borderRadius: 3, cursor: "pointer", fontSize: 9, padding: "2px 7px" }}>✏</button>
          <button onClick={e => { e.stopPropagation(); if (confirm("Delete session?")) onDelete(); }}
            style={{ background: "none", border: "1px solid rgba(139,26,26,.3)", color: "rgba(139,26,26,.6)",
              borderRadius: 3, cursor: "pointer", fontSize: 9, padding: "2px 7px" }}>✕</button>
          <span style={{ color: "rgba(200,149,42,.5)", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(92,51,23,.25)", padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.length === 0 ? (
            <div style={{ fontSize: 11, color: "rgba(245,230,200,.3)", fontStyle: "italic",
              fontFamily: "'IM Fell English',serif" }}>No notes recorded for this session.</div>
          ) : fields.map(([label, value]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1.5,
                color: "var(--gold)", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--vel)", fontFamily: "'IM Fell English',serif",
                lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignForm({ campaign, onSave, onCancel }) {
  const [form, setForm] = useState(campaign || {
    id: genId(), name: "", system: "D&D 5e 2024",
    status: "active", setting: "", premise: "",
    dmNotes: "", players: "",
  });

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const iStyle = {
    background: "rgba(245,230,200,.05)", border: "1px solid rgba(92,51,23,.4)",
    borderRadius: 3, color: "var(--vel)", fontFamily: "'IM Fell English',serif",
    fontSize: 12, padding: "4px 8px", outline: "none", width: "100%",
  };
  const taStyle = { ...iStyle, resize: "vertical", minHeight: 60 };
  const lStyle = { fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: 1.5,
    color: "var(--br)", textTransform: "uppercase", marginBottom: 3 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#1a0a02", border: "2px solid var(--gold)", borderRadius: 6,
        padding: 20, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", color: "var(--gold)", fontSize: 14, marginBottom: 14 }}>
          {campaign ? "Edit Campaign" : "New Campaign"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={lStyle}>Campaign Name</div>
            <input style={iStyle} value={form.name} onChange={e => f("name", e.target.value)}
              placeholder="Curse of Strahd, homebrew…" />
          </div>
          <div>
            <div style={lStyle}>System</div>
            <input style={iStyle} value={form.system} onChange={e => f("system", e.target.value)} />
          </div>
          <div>
            <div style={lStyle}>Status</div>
            <select style={iStyle} value={form.status} onChange={e => f("status", e.target.value)}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={lStyle}>Players</div>
            <input style={iStyle} value={form.players} onChange={e => f("players", e.target.value)}
              placeholder="Alice, Bob, Carlos, Diana…" />
          </div>
          {[["setting","World / Setting","Forgotten Realms, Eberron, homebrew…"],
            ["premise","Premise / Hook","The party is hired to investigate…"],
            ["dmNotes","DM Notes","Private planning, secrets, long-term arcs…"]].map(([k,l,ph]) => (
            <div key={k} style={{ gridColumn: "1/-1" }}>
              <div style={lStyle}>{l}</div>
              <textarea style={taStyle} value={form[k]} placeholder={ph}
                onChange={e => f(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel}
            style={{ background: "none", border: "1px solid rgba(92,51,23,.5)",
              color: "var(--br)", borderRadius: 3, cursor: "pointer",
              fontFamily: "'Cinzel',serif", fontSize: 10, padding: "6px 16px" }}>
            Cancel
          </button>
          <button onClick={() => onSave(form)}
            style={{ background: "var(--gold)", border: "none", color: "var(--ink)",
              borderRadius: 3, cursor: "pointer", fontFamily: "'Cinzel',serif",
              fontSize: 10, padding: "6px 20px", fontWeight: 700, letterSpacing: 1 }}>
            ✦ Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignTracker({ campaigns, sessions, onSaveCampaign, onDeleteCampaign, onSaveSession, onDeleteSession }) {
  const [activeCampaignId, setActiveCampaignId] = useState(campaigns[0]?.id || null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  const campaignSessions = sessions
    .filter(s => s.campaignId === activeCampaignId)
    .sort((a, b) => b.number - a.number);

  const totalXP = campaignSessions.reduce((sum, s) => sum + (Number(s.xp) || 0), 0);

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {/* Campaign list sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
            color: "var(--gold)", textTransform: "uppercase" }}>Campaigns</div>
          <button onClick={() => setShowCampaignForm(true)}
            style={{ background: "rgba(200,149,42,.15)", border: "1px solid var(--gold)",
              color: "var(--gold)", borderRadius: 3, cursor: "pointer",
              fontFamily: "'Cinzel',serif", fontSize: 9, padding: "3px 9px", fontWeight: 700 }}>
            + New
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 10px", color: "rgba(245,230,200,.25)",
            fontStyle: "italic", fontFamily: "'IM Fell English',serif", fontSize: 12,
            border: "1px dashed rgba(92,51,23,.3)", borderRadius: 4 }}>
            No campaigns yet.<br />Create one to begin.
          </div>
        ) : (
          campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              sessions={sessions}
              isActive={c.id === activeCampaignId}
              onSelect={() => setActiveCampaignId(c.id)}
              onDelete={onDeleteCampaign}
            />
          ))
        )}
      </div>

      {/* Campaign detail */}
      <div style={{ flex: 1, minWidth: 300 }}>
        {!activeCampaign ? (
          <div style={{ textAlign: "center", padding: "60px 20px",
            color: "rgba(245,230,200,.2)", fontFamily: "'IM Fell English',serif",
            fontStyle: "italic", fontSize: 14, border: "1px dashed rgba(92,51,23,.2)", borderRadius: 4 }}>
            Select or create a campaign
          </div>
        ) : (
          <>
            {/* Campaign header */}
            <div style={{ background: "rgba(26,10,2,.7)", border: "1px solid rgba(92,51,23,.4)",
              borderRadius: 4, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 16, color: "var(--gold)" }}>
                    {activeCampaign.name}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(245,230,200,.4)", fontFamily: "'Cinzel',serif",
                    letterSpacing: .5, marginTop: 2 }}>
                    {activeCampaign.system}
                    {activeCampaign.players ? ` · ${activeCampaign.players}` : ""}
                  </div>
                </div>
                <button onClick={() => { setEditingCampaign(activeCampaign); setShowCampaignForm(true); }}
                  style={{ background: "rgba(200,149,42,.1)", border: "1px solid rgba(200,149,42,.3)",
                    color: "rgba(200,149,42,.7)", borderRadius: 3, cursor: "pointer", fontSize: 9,
                    padding: "3px 9px", fontFamily: "'Cinzel',serif", flexShrink: 0 }}>✏ Edit</button>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                {[
                  ["Sessions", campaignSessions.length],
                  ["Total XP", totalXP.toLocaleString()],
                  ["Status", activeCampaign.status || "active"],
                ].map(([label, val]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 14, color: "var(--gold)" }}>{val}</div>
                    <div style={{ fontSize: 8, color: "rgba(245,230,200,.4)", fontFamily: "'Cinzel',serif",
                      letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>

              {activeCampaign.setting && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 9, color: "rgba(200,149,42,.6)", fontFamily: "'Cinzel',serif",
                    letterSpacing: 1, textTransform: "uppercase" }}>Setting: </span>
                  <span style={{ fontSize: 11, color: "var(--vel)", fontFamily: "'IM Fell English',serif" }}>
                    {activeCampaign.setting}
                  </span>
                </div>
              )}
              {activeCampaign.premise && (
                <div style={{ marginTop: 4, fontSize: 11, color: "rgba(245,230,200,.6)",
                  fontFamily: "'IM Fell English',serif", fontStyle: "italic", lineHeight: 1.5 }}>
                  {activeCampaign.premise}
                </div>
              )}
              {activeCampaign.dmNotes && (
                <div style={{ marginTop: 8, background: "rgba(200,149,42,.05)",
                  border: "1px solid rgba(200,149,42,.15)", borderRadius: 3, padding: "7px 10px" }}>
                  <div style={{ fontSize: 8, color: "rgba(200,149,42,.5)", fontFamily: "'Cinzel',serif",
                    letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>DM Notes</div>
                  <div style={{ fontSize: 11, color: "rgba(245,230,200,.6)",
                    fontFamily: "'IM Fell English',serif", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {activeCampaign.dmNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Sessions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: 2,
                color: "var(--gold)", textTransform: "uppercase" }}>
                Session Log ({campaignSessions.length})
              </div>
              <button onClick={() => { setEditingSession(null); setShowSessionForm(true); }}
                style={{ background: "rgba(200,149,42,.15)", border: "1px solid var(--gold)",
                  color: "var(--gold)", borderRadius: 3, cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 9, padding: "4px 12px", fontWeight: 700 }}>
                + Log Session
              </button>
            </div>

            {showSessionForm && (
              <div style={{ marginBottom: 12 }}>
                <SessionForm
                  campaignId={activeCampaignId}
                  session={editingSession}
                  onSave={s => { onSaveSession(s); setShowSessionForm(false); setEditingSession(null); }}
                  onCancel={() => { setShowSessionForm(false); setEditingSession(null); }}
                />
              </div>
            )}

            {campaignSessions.length === 0 && !showSessionForm ? (
              <div style={{ textAlign: "center", padding: "30px 20px",
                color: "rgba(245,230,200,.2)", fontFamily: "'IM Fell English',serif",
                fontStyle: "italic", fontSize: 12, border: "1px dashed rgba(92,51,23,.2)", borderRadius: 4 }}>
                No sessions logged yet. Every great campaign starts somewhere.
              </div>
            ) : (
              campaignSessions.map(s => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onEdit={() => { setEditingSession(s); setShowSessionForm(true); }}
                  onDelete={() => onDeleteSession(s.id)}
                />
              ))
            )}
          </>
        )}
      </div>

      {showCampaignForm && (
        <CampaignForm
          campaign={editingCampaign}
          onSave={c => {
            onSaveCampaign(c);
            setActiveCampaignId(c.id);
            setShowCampaignForm(false);
            setEditingCampaign(null);
          }}
          onCancel={() => { setShowCampaignForm(false); setEditingCampaign(null); }}
        />
      )}
    </div>
  );
}
