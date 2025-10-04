import SQLite from 'react-native-sqlite-storage';

export class DatabaseInit {
  private static database: SQLite.SQLiteDatabase | null = null;

  static async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.database) {
      await this.init();
    }
    return this.database!;
  }

  static async init(): Promise<void> {
    try {
      // Prevent multiple initialization attempts
      if (this.database) {
        console.log('Database already initialized');
        return;
      }

      console.log('Starting database initialization...');
      SQLite.enablePromise(true);
      SQLite.DEBUG(false);

      this.database = await SQLite.openDatabase({
        name: 'FXSimulator.db',
        location: 'default',
      });

      console.log('Database opened, creating tables...');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      // Reset database reference on error
      this.database = null;
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not opened');
    }

    const queries = [
      // 価格データテーブル
      `CREATE TABLE IF NOT EXISTS price_data (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL,
        currency_pair TEXT NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 複合インデックス
      `CREATE INDEX IF NOT EXISTS idx_price_date_pair
       ON price_data(currency_pair, date DESC)`,

      // 取引テーブル
      `CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        open_date INTEGER NOT NULL,
        close_date INTEGER,
        currency_pair TEXT NOT NULL,
        trade_type TEXT NOT NULL CHECK(trade_type IN ('buy', 'sell')),
        amount REAL NOT NULL,
        open_price REAL NOT NULL,
        close_price REAL,
        profit REAL,
        status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 仮想口座テーブル
      `CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY DEFAULT '1',
        balance REAL NOT NULL,
        initial_balance REAL NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // デフォルト口座データ挿入（初期資金100万円）
      `INSERT OR IGNORE INTO account (id, balance, initial_balance)
       VALUES ('1', 1000000, 1000000)`,
    ];

    try {
      for (const query of queries) {
        console.log('Executing query:', query.substring(0, 50) + '...');
        await this.database.executeSql(query);
      }
      console.log('All tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw new Error(`Failed to create tables: ${error}`);
    }
  }

  static async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}
