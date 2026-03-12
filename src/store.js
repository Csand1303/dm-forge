// ─── Unified localStorage persistence layer ───────────────────────────────────
// All data lives under 'dnd_dm_v1' key as one JSON blob.
// Shape:
// {
//   characters: [...],        // existing character sheets
//   campaigns: [...],         // campaign objects
//   sessions: [...],          // session logs
//   combats: [...],           // saved combat states
//   customMonsters: [...],    // DM-created NPCs/monsters
//   pinnedMonsters: [...],    // monster ids pinned for quick access
// }

const STORAGE_KEY = 'dnd_dm_v1';

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw);
    // Migrate old character-only storage
    if (Array.isArray(parsed)) {
      return { ...defaultStore(), characters: parsed };
    }
    return { ...defaultStore(), ...parsed };
  } catch {
    return defaultStore();
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function defaultStore() {
  return {
    characters: [],
    campaigns: [],
    sessions: [],
    combats: [],
    customMonsters: [],
    pinnedMonsters: [],
  };
}

export function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
