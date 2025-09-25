import { DatabaseInit } from '../services/database/DatabaseInit';
import { PersonalRecord, PerformanceMetrics, RankingPeriod, RankingCategory } from '../store/slices/rankingSlice';

interface PersonalRecordRow {
  id: string;
  category: RankingCategory;
  value: number;
  achieved_at: number;
  period: RankingPeriod;
  description: string;
  previous_best?: number;
  improvement?: number;
  metadata?: string; // JSON string
}

interface PerformanceMetricsRow {
  id: string;
  period: RankingPeriod;
  total_profit: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  max_drawdown: number;
  consistency_score: number;
  average_risk_reward: number;
  trades_count: number;
  calculated_at: number;
}

export class RankingDatabase {
  static async initializeTables(): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      // Personal Records table
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS personal_records (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          value REAL NOT NULL,
          achieved_at INTEGER NOT NULL,
          period TEXT NOT NULL,
          description TEXT NOT NULL,
          previous_best REAL,
          improvement REAL,
          metadata TEXT
        )
      `);

      // Performance Metrics table
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id TEXT PRIMARY KEY,
          period TEXT NOT NULL,
          total_profit REAL NOT NULL,
          win_rate REAL NOT NULL,
          profit_factor REAL NOT NULL,
          sharpe_ratio REAL NOT NULL,
          max_drawdown REAL NOT NULL,
          consistency_score REAL NOT NULL,
          average_risk_reward REAL NOT NULL,
          trades_count INTEGER NOT NULL,
          calculated_at INTEGER NOT NULL,
          UNIQUE(period)
        )
      `);

      // Indexes for better performance
      await db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_personal_records_category_period
        ON personal_records(category, period, achieved_at DESC)
      `);

      await db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_period
        ON performance_metrics(period, calculated_at DESC)
      `);

      console.log('Ranking tables created successfully');
    } catch (error) {
      console.error('Error creating ranking tables:', error);
      throw error;
    }
  }

  static async savePersonalRecord(record: PersonalRecord): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      await db.executeSql(
        `INSERT OR REPLACE INTO personal_records
         (id, category, value, achieved_at, period, description, previous_best, improvement, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.category,
          record.value,
          record.achievedAt,
          record.period,
          record.description,
          record.previousBest || null,
          record.improvement || null,
          record.metadata ? JSON.stringify(record.metadata) : null,
        ]
      );

      console.log('Personal record saved successfully:', record.id);
    } catch (error) {
      console.error('Error saving personal record:', error);
      throw error;
    }
  }

  static async loadPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM personal_records ORDER BY achieved_at DESC'
      );

      const records: PersonalRecord[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as PersonalRecordRow;
        records.push({
          id: row.id,
          category: row.category,
          value: row.value,
          achievedAt: row.achieved_at,
          period: row.period,
          description: row.description,
          previousBest: row.previous_best,
          improvement: row.improvement,
          metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        });
      }

      return records;
    } catch (error) {
      console.error('Error loading personal records:', error);
      throw error;
    }
  }

  static async savePerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      await db.executeSql(
        `INSERT OR REPLACE INTO performance_metrics
         (id, period, total_profit, win_rate, profit_factor, sharpe_ratio, max_drawdown,
          consistency_score, average_risk_reward, trades_count, calculated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `metrics_${metrics.period}`,
          metrics.period,
          metrics.totalProfit,
          metrics.winRate,
          metrics.profitFactor,
          metrics.sharpeRatio,
          metrics.maxDrawdown,
          metrics.consistencyScore,
          metrics.averageRiskReward,
          metrics.tradesCount,
          metrics.calculatedAt,
        ]
      );

      console.log('Performance metrics saved successfully for period:', metrics.period);
    } catch (error) {
      console.error('Error saving performance metrics:', error);
      throw error;
    }
  }

  static async loadPerformanceMetrics(): Promise<{ [key in RankingPeriod]: PerformanceMetrics | null }> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM performance_metrics ORDER BY calculated_at DESC'
      );

      const metricsMap: { [key in RankingPeriod]: PerformanceMetrics | null } = {
        daily: null,
        weekly: null,
        monthly: null,
        yearly: null,
        'all-time': null,
      };

      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as PerformanceMetricsRow;
        metricsMap[row.period] = {
          totalProfit: row.total_profit,
          winRate: row.win_rate,
          profitFactor: row.profit_factor,
          sharpeRatio: row.sharpe_ratio,
          maxDrawdown: row.max_drawdown,
          consistencyScore: row.consistency_score,
          averageRiskReward: row.average_risk_reward,
          tradesCount: row.trades_count,
          period: row.period,
          calculatedAt: row.calculated_at,
        };
      }

      return metricsMap;
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      throw error;
    }
  }

  static async getPersonalRecordsByCategory(category: RankingCategory): Promise<PersonalRecord[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM personal_records WHERE category = ? ORDER BY achieved_at DESC',
        [category]
      );

      const records: PersonalRecord[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as PersonalRecordRow;
        records.push({
          id: row.id,
          category: row.category,
          value: row.value,
          achievedAt: row.achieved_at,
          period: row.period,
          description: row.description,
          previousBest: row.previous_best,
          improvement: row.improvement,
          metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        });
      }

      return records;
    } catch (error) {
      console.error('Error loading personal records by category:', error);
      throw error;
    }
  }

  static async getPersonalRecordsByPeriod(period: RankingPeriod): Promise<PersonalRecord[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM personal_records WHERE period = ? ORDER BY achieved_at DESC',
        [period]
      );

      const records: PersonalRecord[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as PersonalRecordRow;
        records.push({
          id: row.id,
          category: row.category,
          value: row.value,
          achievedAt: row.achieved_at,
          period: row.period,
          description: row.description,
          previousBest: row.previous_best,
          improvement: row.improvement,
          metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        });
      }

      return records;
    } catch (error) {
      console.error('Error loading personal records by period:', error);
      throw error;
    }
  }

  static async getBestRecordForCategory(category: RankingCategory, period: RankingPeriod): Promise<PersonalRecord | null> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM personal_records WHERE category = ? AND period = ? ORDER BY value DESC LIMIT 1',
        [category, period]
      );

      if (results.rows.length > 0) {
        const row = results.rows.item(0) as PersonalRecordRow;
        return {
          id: row.id,
          category: row.category,
          value: row.value,
          achievedAt: row.achieved_at,
          period: row.period,
          description: row.description,
          previousBest: row.previous_best,
          improvement: row.improvement,
          metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading best record for category:', error);
      throw error;
    }
  }

  static async deletePersonalRecord(recordId: string): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      await db.executeSql('DELETE FROM personal_records WHERE id = ?', [recordId]);

      console.log('Personal record deleted successfully');
    } catch (error) {
      console.error('Error deleting personal record:', error);
      throw error;
    }
  }

  static async clearOldMetrics(daysToKeep: number = 30): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

      await db.executeSql(
        'DELETE FROM performance_metrics WHERE calculated_at < ?',
        [cutoffTime]
      );

      console.log('Old performance metrics cleared');
    } catch (error) {
      console.error('Error clearing old metrics:', error);
      throw error;
    }
  }

  static async getRankingStatistics(): Promise<{
    totalRecords: number;
    recordsThisMonth: number;
    bestCategory: RankingCategory | null;
    mostActiveMonth: string | null;
  }> {
    try {
      const db = await DatabaseInit.getDatabase();

      // Total records
      const [totalResults] = await db.executeSql('SELECT COUNT(*) as total FROM personal_records');
      const totalRecords = totalResults.rows.item(0).total;

      // Records this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const [monthResults] = await db.executeSql(
        'SELECT COUNT(*) as total FROM personal_records WHERE achieved_at >= ?',
        [thisMonth.getTime()]
      );
      const recordsThisMonth = monthResults.rows.item(0).total;

      // Best category (most records)
      const [categoryResults] = await db.executeSql(`
        SELECT category, COUNT(*) as count
        FROM personal_records
        GROUP BY category
        ORDER BY count DESC
        LIMIT 1
      `);
      const bestCategory = categoryResults.rows.length > 0 ? categoryResults.rows.item(0).category : null;

      // Most active month
      const [monthlyResults] = await db.executeSql(`
        SELECT strftime('%Y-%m', datetime(achieved_at / 1000, 'unixepoch')) as month,
               COUNT(*) as count
        FROM personal_records
        GROUP BY month
        ORDER BY count DESC
        LIMIT 1
      `);
      const mostActiveMonth = monthlyResults.rows.length > 0 ? monthlyResults.rows.item(0).month : null;

      return {
        totalRecords,
        recordsThisMonth,
        bestCategory,
        mostActiveMonth,
      };
    } catch (error) {
      console.error('Error loading ranking statistics:', error);
      throw error;
    }
  }
}