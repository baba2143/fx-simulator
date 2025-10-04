import RNFS from 'react-native-fs';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseInit } from '../database/DatabaseInit';
import { CurrencyPair } from '../../types';
import SQLite from 'react-native-sqlite-storage';

export class CSVImporter {
  private static readonly BATCH_SIZE = 100;

  static async importHistoricalData(
    currencyPair: CurrencyPair,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      // 既存データをチェック
      const existingData = await db.executeSql(
        'SELECT COUNT(*) as count FROM price_data WHERE currency_pair = ?',
        [currencyPair],
      );

      if (existingData[0].rows.item(0).count > 0) {
        console.log(`Data for ${currencyPair} already exists, skipping import`);
        if (onProgress) {
          onProgress(100);
        }
        return;
      }

      // CSVファイルを読み込み（アセットから）
      // iOSではMainBundlePath、AndroidではreadFileAssetsを使用
      let csvContent: string;
      if (RNFS.MainBundlePath) {
        // iOS
        const filePath = `${RNFS.MainBundlePath}/data/${currencyPair}_daily.csv`;
        csvContent = await RNFS.readFile(filePath, 'utf8');
      } else {
        // Android
        csvContent = await RNFS.readFileAssets(`data/${currencyPair}_daily.csv`, 'utf8');
      }
      const lines = csvContent.split('\n').filter(line => line.trim());

      // ヘッダーをチェック
      const hasHeader = lines[0] && lines[0].toLowerCase().includes('date');
      const dataLines = hasHeader ? lines.slice(1) : lines;
      const totalLines = dataLines.length;

      // トランザクション開始
      await db.executeSql('BEGIN TRANSACTION');

      try {
        for (let i = 0; i < dataLines.length; i += this.BATCH_SIZE) {
          const batch = dataLines.slice(i, i + this.BATCH_SIZE);
          await this.insertBatch(db, currencyPair, batch);

          // 進捗を通知
          if (onProgress) {
            const progress = Math.min(((i + this.BATCH_SIZE) / totalLines) * 100, 100);
            onProgress(progress);
          }
        }

        await db.executeSql('COMMIT');
        console.log(`Successfully imported ${totalLines} records for ${currencyPair}`);
      } catch (error) {
        await db.executeSql('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`Error importing ${currencyPair}:`, error);
      throw error;
    }
  }

  private static async insertBatch(
    db: SQLite.SQLiteDatabase,
    currencyPair: CurrencyPair,
    lines: string[],
  ): Promise<void> {
    const values: any[] = [];
    const placeholders: string[] = [];

    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length < 5) {
        continue;
      }

      const [dateStr, open, high, low, close] = parts;

      if (!dateStr || !open || !high || !low || !close) {
        continue;
      }

      // 日付形式を判定（YYYYMMDD or YYYY-MM-DD）
      let year, month, day;
      if (dateStr.includes('-')) {
        // YYYY-MM-DD形式
        const dateParts = dateStr.split('-');
        year = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10) - 1;
        day = parseInt(dateParts[2], 10);
      } else if (dateStr.length === 8) {
        // YYYYMMDD形式
        year = parseInt(dateStr.substring(0, 4), 10);
        month = parseInt(dateStr.substring(4, 6), 10) - 1;
        day = parseInt(dateStr.substring(6, 8), 10);
      } else {
        continue; // 不明な形式はスキップ
      }

      const date = new Date(year, month, day).getTime();

      values.push(
        uuidv4(),
        date,
        currencyPair,
        parseFloat(open),
        parseFloat(high),
        parseFloat(low),
        parseFloat(close),
      );

      placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
    }

    if (placeholders.length > 0) {
      const query = `INSERT INTO price_data (id, date, currency_pair, open, high, low, close)
                     VALUES ${placeholders.join(', ')}`;
      await db.executeSql(query, values);
    }
  }

  static async importAllCurrencyPairs(
    onProgress?: (pair: CurrencyPair, progress: number) => void,
  ): Promise<void> {
    const pairs: CurrencyPair[] = [
      'USDJPY',
      'EURUSD',
      'EURJPY',
      'GBPUSD',
      'GBPJPY',
      'AUDJPY',
      'XAUJPY',
      'XAUUSD',
    ];

    for (const pair of pairs) {
      await this.importHistoricalData(pair, progress => {
        if (onProgress) {
          onProgress(pair, progress);
        }
      });
    }
  }
}
