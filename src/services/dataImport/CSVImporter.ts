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
        if (onProgress) onProgress(100);
        return;
      }

      // CSVファイルを読み込み（アセットから）
      const csvContent = await RNFS.readFileAssets(`data/${currencyPair}_daily.csv`, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      // ヘッダーをスキップ
      const dataLines = lines.slice(1);
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
      const [dateStr, open, high, low, close] = line.split(',');

      if (!dateStr || !open || !high || !low || !close) continue;

      // YYYYMMDDをタイムスタンプに変換
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1;
      const day = parseInt(dateStr.substring(6, 8), 10);
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
    const pairs: CurrencyPair[] = ['USDJPY', 'EURUSD', 'EURJPY', 'GBPUSD', 'GBPJPY', 'AUDJPY'];

    for (const pair of pairs) {
      await this.importHistoricalData(pair, progress => {
        if (onProgress) onProgress(pair, progress);
      });
    }
  }
}
