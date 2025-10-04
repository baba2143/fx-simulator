import { DatabaseInit } from '../services/database/DatabaseInit';
import { Goal, GoalProgress, GoalType, GoalStatus } from '../store/slices/goalSlice';

interface GoalRow {
  id: string;
  type: GoalType;
  target_amount: number;
  current_amount: number;
  start_date: number;
  end_date: number;
  status: GoalStatus;
  description?: string;
  created_at: number;
  completed_at?: number;
}

interface GoalProgressRow {
  id: number;
  goal_id: string;
  date: number;
  daily_profit: number;
  cumulative_profit: number;
  trades_count: number;
  win_rate: number;
}

export class GoalDatabase {
  static async initializeTables(): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      // Goals table
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS goals (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL DEFAULT 0,
          start_date INTEGER NOT NULL,
          end_date INTEGER NOT NULL,
          status TEXT NOT NULL,
          description TEXT,
          created_at INTEGER NOT NULL,
          completed_at INTEGER
        )
      `);

      // Goal Progress table
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS goal_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id TEXT NOT NULL,
          date INTEGER NOT NULL,
          daily_profit REAL NOT NULL,
          cumulative_profit REAL NOT NULL,
          trades_count INTEGER NOT NULL,
          win_rate REAL NOT NULL,
          FOREIGN KEY (goal_id) REFERENCES goals (id),
          UNIQUE(goal_id, date)
        )
      `);

      console.log('Goal tables created successfully');
    } catch (error) {
      console.error('Error creating goal tables:', error);
      throw error;
    }
  }

  static async saveGoal(goal: Goal): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      await db.executeSql(
        `INSERT OR REPLACE INTO goals
         (id, type, target_amount, current_amount, start_date, end_date, status, description, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          goal.id,
          goal.type,
          goal.targetAmount,
          goal.currentAmount,
          goal.startDate,
          goal.endDate,
          goal.status,
          goal.description || null,
          goal.createdAt,
          goal.completedAt || null,
        ],
      );

      console.log('Goal saved successfully:', goal.id);
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  static async loadGoals(): Promise<Goal[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql('SELECT * FROM goals ORDER BY created_at DESC');

      const goals: Goal[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as GoalRow;
        goals.push({
          id: row.id,
          type: row.type,
          targetAmount: row.target_amount,
          currentAmount: row.current_amount,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          description: row.description,
          createdAt: row.created_at,
          completedAt: row.completed_at,
        });
      }

      return goals;
    } catch (error) {
      console.error('Error loading goals:', error);
      throw error;
    }
  }

  static async saveGoalProgress(progress: GoalProgress): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      await db.executeSql(
        `INSERT OR REPLACE INTO goal_progress
         (goal_id, date, daily_profit, cumulative_profit, trades_count, win_rate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          progress.goalId,
          progress.date,
          progress.dailyProfit,
          progress.cumulativeProfit,
          progress.tradesCount,
          progress.winRate,
        ],
      );

      console.log('Goal progress saved successfully');
    } catch (error) {
      console.error('Error saving goal progress:', error);
      throw error;
    }
  }

  static async loadGoalProgress(): Promise<GoalProgress[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql('SELECT * FROM goal_progress ORDER BY date DESC');

      const progressList: GoalProgress[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as GoalProgressRow;
        progressList.push({
          goalId: row.goal_id,
          date: row.date,
          dailyProfit: row.daily_profit,
          cumulativeProfit: row.cumulative_profit,
          tradesCount: row.trades_count,
          winRate: row.win_rate,
        });
      }

      return progressList;
    } catch (error) {
      console.error('Error loading goal progress:', error);
      throw error;
    }
  }

  static async deleteGoal(goalId: string): Promise<void> {
    try {
      const db = await DatabaseInit.getDatabase();

      // Delete goal progress first
      await db.executeSql('DELETE FROM goal_progress WHERE goal_id = ?', [goalId]);

      // Delete goal
      await db.executeSql('DELETE FROM goals WHERE id = ?', [goalId]);

      console.log('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  static async getGoalsByType(type: GoalType): Promise<Goal[]> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM goals WHERE type = ? ORDER BY created_at DESC',
        [type],
      );

      const goals: Goal[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i) as GoalRow;
        goals.push({
          id: row.id,
          type: row.type,
          targetAmount: row.target_amount,
          currentAmount: row.current_amount,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          description: row.description,
          createdAt: row.created_at,
          completedAt: row.completed_at,
        });
      }

      return goals;
    } catch (error) {
      console.error('Error loading goals by type:', error);
      throw error;
    }
  }

  static async getActiveGoal(type: GoalType): Promise<Goal | null> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(
        'SELECT * FROM goals WHERE type = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
        [type],
      );

      if (results.rows.length > 0) {
        const row = results.rows.item(0) as GoalRow;
        return {
          id: row.id,
          type: row.type,
          targetAmount: row.target_amount,
          currentAmount: row.current_amount,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          description: row.description,
          createdAt: row.created_at,
          completedAt: row.completed_at,
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading active goal:', error);
      throw error;
    }
  }

  static async getGoalStatistics(): Promise<{
    totalGoalsCreated: number;
    goalsCompleted: number;
    goalsSuccessRate: number;
  }> {
    try {
      const db = await DatabaseInit.getDatabase();
      const [results] = await db.executeSql(`
        SELECT
          COUNT(*) as total_goals,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals
        FROM goals
      `);

      const row = results.rows.item(0);
      const totalGoals = row.total_goals || 0;
      const completedGoals = row.completed_goals || 0;
      const successRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      return {
        totalGoalsCreated: totalGoals,
        goalsCompleted: completedGoals,
        goalsSuccessRate: successRate,
      };
    } catch (error) {
      console.error('Error loading goal statistics:', error);
      throw error;
    }
  }
}
