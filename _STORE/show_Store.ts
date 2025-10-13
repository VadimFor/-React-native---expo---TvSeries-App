// store/showStore.ts
import { create } from "zustand";
import { executeSql, queryAll } from "@/sqlite";
import { Show } from "@/props/props";

type ShowStore = {
  shows: Show[];
  ids_favorites: string[];
  ids_saved: string[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  toggleFavorite: (show: Show) => Promise<void>;
  toggleSave: (show: Show) => Promise<void>;
  store_setShows: (shows: Show[]) => void;
  store_addInfoShow: (id: string, data: Partial<Show>) => void;
  store_addShows: (newShows: Show[]) => void; 

  store_getFavoriteShows: () => Show[];
  store_getSavedShows: () => Show[];

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
  ids_favorites: [],
  ids_saved: [],
  loading: false,

  store_getFavoriteShows: () => {
    const { shows, ids_favorites } = get();
    return shows.filter((s) => ids_favorites.includes(s.id));
  },

  store_getSavedShows: () => {
    const { shows, ids_saved } = get();
    return shows.filter((s) => ids_saved.includes(s.id));
  },

  store_setShows: (shows) => set({ shows }),

  store_addShows: (newShows) => {
    const current = get().shows;
    const merged = [
      ...current.filter((s) => !newShows.some((n) => n.id === s.id)),
      ...newShows,
    ];
    set({ shows: merged });
  },

  store_addInfoShow: (id : string, data : Partial<Show>) => {
    set({
      shows: get().shows.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    });
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      
      const showsRaw : string[] = await queryAll<any>("SELECT * FROM shows ORDER BY rank ASC");
      const favoritesRaw = await queryAll<{ id: string }>(
        "SELECT id FROM Favorites ORDER BY id ASC"
      );
      const savedRaw = await queryAll<{ id: string }>(
        "SELECT id FROM Saved ORDER BY id ASC"
      );

      // Normalize
      const s = showsRaw.map(normalizeShow);
      const idsFav = favoritesRaw.map((f) => f.id);
      const idsSav = savedRaw.map((s) => s.id);

      console.log("saved.length: " ,idsSav.length)
      console.log("fav.length: " ,idsFav.length)
      set({ shows : s, ids_favorites : idsFav, ids_saved : idsSav, loading: false });
    } catch (err) {
      console.error("Error fetching data:", err);
      set({ loading: false });
    }
  },

  toggleFavorite: async (show: Show) => {
    const { ids_favorites} = get();

    if (ids_favorites.some((show_id) => show_id === show.id)) {
      // remove
      set({ ids_favorites: ids_favorites.filter((s_id) => (s_id) !== show.id) });
      await executeSql("DELETE FROM Favorites WHERE id = ?", [show.id]);
    } else {
      // add
      set({ ids_favorites: [...ids_favorites, show.id] });
      await executeSql("INSERT OR IGNORE INTO Favorites (id) VALUES (?)", [show.id]);
    }
  },
  toggleSave: async (show: Show) => {
    const { ids_saved} = get();

    if (ids_saved.some((s) => s === show.id)) {
      // remove
      set({ ids_saved: ids_saved.filter((s_id) => s_id !== show.id) });
      await executeSql("DELETE FROM saved WHERE id = ?", [show.id]);
    } else {
      // add
      set({ ids_saved: [...ids_saved, show.id] });
      await executeSql("INSERT OR IGNORE INTO saved (id) VALUES (?)", [show.id]);
    }
  },
  
}));
