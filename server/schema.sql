-- Torque Guard database (Cloudflare D1). Paste this into D1 → your database → Console and press Execute.
CREATE TABLE IF NOT EXISTS players(pid TEXT PRIMARY KEY, first INTEGER, last INTEGER, ver INTEGER, app INTEGER,
  money INTEGER, sold INTEGER, xp INTEGER, vip INTEGER, lv INTEGER, best INTEGER, tk INTEGER, gtk INTEGER,
  heroes INTEGER, stars INTEGER, mythic INTEGER, score INTEGER DEFAULT 0, banned INTEGER DEFAULT 0, reason TEXT, flags TEXT);
CREATE INDEX IF NOT EXISTS players_last ON players(last);
CREATE TABLE IF NOT EXISTS snaps(pid TEXT, t INTEGER, money INTEGER, lv INTEGER, tk INTEGER, vip INTEGER, best INTEGER);
CREATE INDEX IF NOT EXISTS snaps_pid_t ON snaps(pid, t);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, pid TEXT, t INTEGER, kind TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS purchases(token TEXT PRIMARY KEY, pid TEXT, sku TEXT, type TEXT, t INTEGER, state TEXT, expiry INTEGER);
CREATE TABLE IF NOT EXISTS purchase_use(token TEXT, pid TEXT, t INTEGER, PRIMARY KEY(token, pid));
