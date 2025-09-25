import { DatabaseInit } from './DatabaseInit';
import { PriceData, CurrencyPair, Trade, TradeType, Account } from '../../types';

export class DatabaseService {
  static async getPriceData(
    pair: CurrencyPair,
    startDate: Date,
    endDate: Date,
  ): Promise<PriceData[]> {
    const db = await DatabaseInit.getDatabase();
    const result = await db.executeSql(
      `SELECT * FROM price_data
       WHERE currency_pair = ? AND date >= ? AND date <= ?
       ORDER BY date ASC`,
      [pair, startDate.getTime(), endDate.getTime()],
    );

    const priceData: PriceData[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      priceData.push({
        id: row.id,
        date: row.date,
        currencyPair: row.currency_pair,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        createdAt: row.created_at,
      });
    }
    return priceData;
  }

  static async getLatestPrice(pair: CurrencyPair): Promise<PriceData | null> {
    const db = await DatabaseInit.getDatabase();
    const result = await db.executeSql(
      `SELECT * FROM price_data
       WHERE currency_pair = ?
       ORDER BY date DESC LIMIT 1`,
      [pair],
    );

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      return {
        id: row.id,
        date: row.date,
        currencyPair: row.currency_pair,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        createdAt: row.created_at,
      };
    }
    return null;
  }

  static async getAccount(): Promise<Account> {
    const db = await DatabaseInit.getDatabase();
    const result = await db.executeSql('SELECT * FROM account WHERE id = "1"');
    const row = result[0].rows.item(0);
    return {
      id: row.id,
      balance: row.balance,
      initialBalance: row.initial_balance,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async updateAccountBalance(balance: number): Promise<void> {
    const db = await DatabaseInit.getDatabase();
    await db.executeSql(
      `UPDATE account
       SET balance = ?, updated_at = ?
       WHERE id = "1"`,
      [balance, Date.now()],
    );
  }

  static async createTrade(
    currencyPair: CurrencyPair,
    tradeType: TradeType,
    amount: number,
    openPrice: number,
  ): Promise<Trade> {
    const db = await DatabaseInit.getDatabase();
    const id = require('uuid').v4();
    const openDate = Date.now();

    await db.executeSql(
      `INSERT INTO trades
       (id, open_date, currency_pair, trade_type, amount, open_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, openDate, currencyPair, tradeType, amount, openPrice, 'open'],
    );

    return {
      id,
      openDate,
      currencyPair,
      tradeType,
      amount,
      openPrice,
      status: 'open',
      createdAt: openDate,
    };
  }

  static async closeTrade(tradeId: string, closePrice: number): Promise<Trade> {
    const db = await DatabaseInit.getDatabase();
    const closeDate = Date.now();

    // 取引情報を取得
    const tradeResult = await db.executeSql('SELECT * FROM trades WHERE id = ?', [tradeId]);
    const trade = tradeResult[0].rows.item(0);

    // 損益計算
    const profit =
      trade.trade_type === 'buy'
        ? (closePrice - trade.open_price) * trade.amount
        : (trade.open_price - closePrice) * trade.amount;

    // 取引をクローズ
    await db.executeSql(
      `UPDATE trades
       SET close_date = ?, close_price = ?, profit = ?, status = ?
       WHERE id = ?`,
      [closeDate, closePrice, profit, 'closed', tradeId],
    );

    // 口座残高を更新
    const account = await this.getAccount();
    await this.updateAccountBalance(account.balance + profit);

    return {
      id: trade.id,
      openDate: trade.open_date,
      closeDate,
      currencyPair: trade.currency_pair,
      tradeType: trade.trade_type,
      amount: trade.amount,
      openPrice: trade.open_price,
      closePrice,
      profit,
      status: 'closed',
      createdAt: trade.created_at,
    };
  }

  static async getOpenTrades(): Promise<Trade[]> {
    const db = await DatabaseInit.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM trades WHERE status = "open" ORDER BY open_date DESC',
    );

    const trades: Trade[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      trades.push({
        id: row.id,
        openDate: row.open_date,
        closeDate: row.close_date,
        currencyPair: row.currency_pair,
        tradeType: row.trade_type,
        amount: row.amount,
        openPrice: row.open_price,
        closePrice: row.close_price,
        profit: row.profit,
        status: row.status,
        createdAt: row.created_at,
      });
    }
    return trades;
  }

  static async getClosedTrades(limit: number = 50): Promise<Trade[]> {
    const db = await DatabaseInit.getDatabase();
    const result = await db.executeSql(
      'SELECT * FROM trades WHERE status = "closed" ORDER BY close_date DESC LIMIT ?',
      [limit],
    );

    const trades: Trade[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      trades.push({
        id: row.id,
        openDate: row.open_date,
        closeDate: row.close_date,
        currencyPair: row.currency_pair,
        tradeType: row.trade_type,
        amount: row.amount,
        openPrice: row.open_price,
        closePrice: row.close_price,
        profit: row.profit,
        status: row.status,
        createdAt: row.created_at,
      });
    }
    return trades;
  }
}
