import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Lang = "en" | "es" | "ru";

type TranslationMap = Record<string, { en: string; es: string; ru: string }>;

const translations: TranslationMap = {
  // --- Global Tabs ---
  popular: { en: "Popular", es: "Popular", ru: "Популярное" },
  liked: { en: "Favorites", es: "Favoritos", ru: "Избранное" },
  search: { en: "Search", es: "Buscar", ru: "Поиск" },

  // --- IMDb screen ---
  sortedBy: { en: "Sorted by", es: "Sort actual", ru: "Сорт" },
  rank: { en: "Rank", es: "Clasificación", ru: "Рейтинг" },
  releaseDate: { en: "Release Date", es: "Estreno", ru: "Дата выхода" },
  sortByRank: {
    en: "Sort by Rank",
    es: "Ordenar por clasificación",
    ru: "Сортировать по рейтингу",
  },
  sortBy: {
    en: "Sort by",
    es: "Sort por",
    ru: "Сорт по",
  },
  loadingShows: {
    en: "Loading shows...",
    es: "Cargando series...",
    ru: "Загрузка сериалов...",
  },

  // --- Search screen ---
  searchSeries: {
    en: "Search series...",
    es: "Buscar series...",
    ru: "Поиск сериалов...",
  },
  noShowsFound: {
    en: "No shows found.",
    es: "No se encontraron series.",
    ru: "Сериалы не найдены.",
  },
  searchButton: { en: "Search", es: "Buscar", ru: "Поиск" },

  // --- Liked screen ---
  followed: { en: "Followed", es: "Seguidos", ru: "Подписки" },
  saved: { en: "Saved", es: "Guardados", ru: "Сохранённое" },
  loadingSaved: {
    en: "Loading saved shows...",
    es: "Cargando series guardadas...",
    ru: "Загрузка сохранённых сериалов...",
  },

  // --- Settings screen ---
  switchToLightMode: {
    en: "🌞 Switch to Light Mode",
    es: "🌞 Cambiar a modo claro",
    ru: "🌞 Переключить на светлый режим",
  },
  switchToDarkMode: {
    en: "🌙 Switch to Dark Mode",
    es: "🌙 Cambiar a modo oscuro",
    ru: "🌙 Переключить на тёмный режим",
  },

darkMode: {
    en: "Dark Mode",
    es: "Modo oscuro",
    ru: "Тёмный режим",
  },
  // --- Other ---
  favorites: { en: "Favorites", es: "Favoritos", ru: "Избранное" },
  settings: { en: "Settings", es: "Configuración", ru: "Настройки" },
  language: { en: "Language", es: "Idioma", ru: "Язык" },
  languageAppliesInstantly: {
    en: "🌍 Language selection applies instantly",
    es: "🌍 El idioma se aplica instantáneamente",
    ru: "🌍 Язык применяется мгновенно",
  },

  // --- ShowCrad Component ---
  notReleased: { en: "Not Released", es: "No estrenado", ru: "Не вышел" },
  episodes: { en: "Episodes", es: "Episodios", ru: "Серии" },
  

  // --- [Show_id].tsx ---
  seasons: {
    en: "Seasons",
    es: "Temporadas",
    ru: "Сезон",
  },
  loading: {
    en: "Loading...",
    es: "Cargando...",
    ru: "Загрузка...",
  },
  loadingTrailer: {
    en: "Loading trailer...",
    es: "Cargando tráiler...",
    ru: "Загрузка трейлера...",
  },
  loadingSeasons: {
    en: "Loading seasons...",
    es: "Cargando temporadas...",
    ru: "Загрузка сезонов...",
  },

};

// ----------------------------
// ✅ Zustand Language Store
// ----------------------------
type LangStore = {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  t: (key: keyof typeof translations) => string;
};

export const useLangStore = create<LangStore>((set, get) => ({
  lang: "en", 

  setLang: async (lang) => {
    set({ lang });
    try {
      await AsyncStorage.setItem("lang", lang);
    } catch (err) {
      console.warn("⚠️ Failed to persist language:", err);
    }
  },

  t: (key : string) => {
    const { lang } = get();
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  },
}));

// ----------------------------
// 🔁 Restore persisted language
// ----------------------------
export async function restoreLastLanguage() {
  try {
    const saved = await AsyncStorage.getItem("lang");
    if (saved && ["en", "es", "ru"].includes(saved)) {
      useLangStore.setState({ lang: saved as Lang });
    }
  } catch (err) {
    console.warn("⚠️ Failed to restore language:", err);
  }
}

// ----------------------------
// 🌐 HTTP Header Helper
// ----------------------------
export const languageHeader = (lang: Lang) =>
  lang === "en"
    ? "en-US,en;q=0.9"
    : lang === "es"
    ? "es-ES,es;q=0.9"
    : "ru-RU,ru;q=0.9";
