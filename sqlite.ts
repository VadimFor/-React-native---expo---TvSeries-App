import * as SQLite from "expo-sqlite";
import { Directory, File, Paths } from "expo-file-system";
import { Show } from "./props/props";

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function initDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (initPromise) return initPromise; // prevent races

  initPromise = (async () => {
    // Ensure the /SQLite directory exists
    const sqliteDir = new Directory(Paths.document, "SQLite");

    // Open or create the DB
    db = await SQLite.openDatabaseAsync("recetario2.db");

    // Log the expected URI
    const dbFile = new File(sqliteDir, "recetario2.db");
    console.log("📂 DB file URI:", dbFile.uri);

        // 🚨 Clear old tables (dev only)
    //await db.execAsync(`DROP TABLE IF EXISTS shows;`);
    //await db.execAsync(`DROP TABLE IF EXISTS Favorites;`);
    //await db.execAsync(`DROP TABLE IF EXISTS saved;`);

    // Initialize schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS shows (
        id TEXT PRIMARY KEY,
        rank INTEGER,
        prevRank INTEGER,
        title TEXT,
        year INTEGER,
        releaseDate TEXT,
        image TEXT,
        rating REAL,
        votes INTEGER,
        titleGenres TEXT,
        certificate TEXT,
        plot TEXT,
        type TEXT,
        episodes INTEGER
      );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Favorites (
            id TEXT PRIMARY KEY,
            FOREIGN KEY (id) REFERENCES shows (id) ON DELETE CASCADE
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS saved (
            id TEXT PRIMARY KEY,
            FOREIGN KEY (id) REFERENCES shows (id) ON DELETE CASCADE
        );
    `);

    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_shows_rank ON shows(rank);`);
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_shows_releaseDate ON shows(releaseDate);`);
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_shows_title ON shows(title);`);
    
    console.log("✅ Database initialized");
    return db;
  })();

  return initPromise;
}

// Delete all rows from the "shows" table
export async function db_cleardb(): Promise<void> {
  if (!db) await initDb();
  await executeSql("DELETE FROM shows");
    await executeSql("DELETE FROM Favorites");
      await executeSql("DELETE FROM saved");
}

// Insert or update a single show
export async function upsertShow(show: any) {
  try {
      await executeSql(
        `INSERT INTO shows 
          (id, rank, prevRank, title, year, releaseDate, image, rating, votes, titleGenres, certificate, plot, type, episodes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            rank = excluded.rank,
            prevRank = excluded.prevRank,
            title = excluded.title,
            year = excluded.year,
            releaseDate = excluded.releaseDate,
            image = excluded.image,
            rating = excluded.rating,
            votes = excluded.votes,
            titleGenres = excluded.titleGenres,
            certificate = excluded.certificate,
            plot = excluded.plot,
            type = excluded.type,
            episodes = excluded.episodes;`,
        [
          show.id,
          show.rank,
          show.prevRank,
          show.title,
          show.year,
          show.releaseDate,
          show.image,
          show.rating,
          show.votes,
          JSON.stringify(show.titleGenres ?? []), //JSON.parse(titleGenres) para leer
          show.certificate,
          show.plot,
          show.type,
          show.episodes,
        ]
      );

    } catch (err) {
    console.error("❌ Error upserting show:", show?.id, err);
  }
}
// Helper: upsert many at once
export async function db_upsertShows(shows: Show[]) {
  try {
    await Promise.all(shows.map((s) => upsertShow(s)));

    // 🔎 Check how many got inserted
    const rows = await queryAll("SELECT * FROM shows");
    console.log("📊 After upsert, shows in DB:", rows.length);
  } catch (err) {
    console.error("❌ Error in db_upsertShows:", err);
  }
}
// Execute a query (INSERT/UPDATE/DELETE)
export async function executeSql(
  sql: string,
  params: any[] = []
): Promise<{ rowsAffected: number; insertId?: number }> {
  if (!db) await initDb();
  const result = await db!.runAsync(sql, params);
  return {
    rowsAffected: result.changes,
    insertId: result.lastInsertRowId,
  };
}

// Query all rows with generic typing
export async function queryAll<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  if (!db) await initDb();
  return db!.getAllAsync<T>(sql, params);
}

// Query first row
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  if (!db) await initDb();
  return db!.getFirstAsync<T>(sql, params);
}
