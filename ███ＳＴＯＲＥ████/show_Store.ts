// store/showStore.ts
import { create } from "zustand";
import { executeSql, queryAll } from "@/sqlite";
import { Show } from "@/props/props";

type ShowStore = {
  shows: Show[];
  favorites: Show[];
  saved: Show[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  toggleFavorite: (show: Show) => Promise<void>;
  toggleSave: (show: Show) => Promise<void>;
  store_setShows: (shows: Show[]) => void; 

};

function normalizeShow(row: any): Show {
  return {
    ...row,
    titleGenres: row.titleGenres ? JSON.parse(row.titleGenres) : [],
  };
}
// Utility: log current DB state
export async function logDbState() {
  try {
    const shows = await queryAll<any>("SELECT * FROM shows ORDER BY rank ASC");
    const favs = await queryAll<any>("SELECT * FROM Favorites");
    const saved = await queryAll<any>("SELECT * FROM saved");

    console.log("📊 Shows in DB:", shows.length);
    console.log("❤️ Favorites in DB:", favs.length, favs);
    console.log("🔖 Saved in DB:", saved.length, saved);
  } catch (err) {
    console.error("❌ Error logging DB state:", err);
  }
}

export const useShowStore = create<ShowStore>((set, get) => ({

  shows: [],
  favorites: [],
  saved: [],
  loading: false,

  store_setShows: (shows) => set({ shows }), // 

  fetchAll: async () => {
    set({ loading: true });
    try {
      
      const sRaw = await queryAll<any>("SELECT * FROM shows ORDER BY rank ASC");
      const fRaw = await queryAll<any>(
        "SELECT s.* FROM Favorites f JOIN shows s ON f.id = s.id ORDER BY rank ASC"
      );
      const savRaw = await queryAll<any>(
        "SELECT s.* FROM saved f JOIN shows s ON f.id = s.id ORDER BY rank ASC"
      );

      const s = sRaw.map(normalizeShow);
      const f = fRaw.map(normalizeShow);
      const sav = savRaw.map(normalizeShow);

      set({ shows : s, favorites : f, saved : sav, loading: false });
    } catch (err) {
      console.error("Error fetching data:", err);
      set({ loading: false });
    }
  },

  toggleFavorite: async (show: Show) => {
    const { favorites } = get();

    if (favorites.some((s) => s.id === show.id)) {
      // remove
      set({ favorites: favorites.filter((s) => s.id !== show.id) });
      await executeSql("DELETE FROM Favorites WHERE id = ?", [show.id]);
    } else {
      // add
      set({ favorites: [...favorites, show] });
      await executeSql("INSERT OR IGNORE INTO Favorites (id) VALUES (?)", [show.id]);
    }
  },
  toggleSave: async (show: Show) => {
    const { saved } = get();

    if (saved.some((s) => s.id === show.id)) {
      // remove
      set({ saved: saved.filter((s) => s.id !== show.id) });
      await executeSql("DELETE FROM saved WHERE id = ?", [show.id]);
    } else {
      // add
      set({ saved: [...saved, show] });
      await executeSql("INSERT OR IGNORE INTO saved (id) VALUES (?)", [show.id]);
    }
  },
  
}));
