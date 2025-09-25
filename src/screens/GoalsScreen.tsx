import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  Goal,
  GoalType,
  createGoal,
  updateGoalProgress,
  pauseGoal,
  resumeGoal,
  deleteGoal,
  updateGoal,
  initializeGoals,
} from '../store/slices/goalSlice';
import { GoalCard } from '../components/goals/GoalCard';
import { CreateGoalModal } from '../components/goals/CreateGoalModal';
import { ProgressBar } from '../components/goals/ProgressBar';
import { GoalDatabase } from '../utils/goalDatabase';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const { width } = Dimensions.get('window');

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
}) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <View style={styles.statsContent}>
      <View style={styles.statsTextContent}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={[styles.statsValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
      <Icon name={icon} size={32} color={color} />
    </View>
  </View>
);

export const GoalsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { goals, activeGoals, statistics } = useSelector((state: RootState) => state.goals);
  const { balance, totalProfit } = useSelector((state: RootState) => state.account.data || {});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'all'>('active');

  useEffect(() => {
    initializeDatabase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
      updateActiveGoalsProgress();
    }, [])
  );

  const initializeDatabase = async () => {
    try {
      await GoalDatabase.initializeTables();
    } catch (error) {
      console.error('Error initializing goal database:', error);
      Alert.alert('エラー', 'データベースの初期化に失敗しました');
    }
  };

  const loadGoals = async () => {
    try {
      const [loadedGoals, goalProgress] = await Promise.all([
        GoalDatabase.loadGoals(),
        GoalDatabase.loadGoalProgress(),
      ]);

      dispatch(initializeGoals({ goals: loadedGoals, progress: goalProgress }));
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('エラー', '目標の読み込みに失敗しました');
    }
  };

  const updateActiveGoalsProgress = () => {
    // 現在のアカウント情報から進捗を更新
    Object.values(activeGoals).forEach(goal => {
      if (goal && totalProfit !== undefined) {
        dispatch(updateGoalProgress({
          goalId: goal.id,
          profit: totalProfit,
          tradesCount: 0, // TODO: 実際の取引数を取得
          winRate: 0, // TODO: 実際の勝率を取得
        }));
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    updateActiveGoalsProgress();
    setRefreshing(false);
  };

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    try {
      // 同じタイプのアクティブな目標があるかチェック
      const existingActiveGoal = await GoalDatabase.getActiveGoal(goalData.type);
      if (existingActiveGoal && !editingGoal) {
        Alert.alert(
          '既存の目標があります',
          `${goalData.type === 'daily' ? '日次' : goalData.type === 'weekly' ? '週次' : '月次'}目標が既に存在します。先に完了または削除してください。`,
          [{ text: 'OK' }]
        );
        return;
      }

      if (editingGoal) {
        // 編集モード
        dispatch(updateGoal({ id: editingGoal.id, updates: goalData }));
        const updatedGoal: Goal = { ...editingGoal, ...goalData };
        await GoalDatabase.saveGoal(updatedGoal);
      } else {
        // 新規作成モード
        dispatch(createGoal(goalData));
        // Reduxから新しく作成されたゴールを取得してDBに保存
        // Note: 実際の実装では、createGoalアクションでIDを含めて返すか、
        // 別途IDを生成してDBに保存する必要があります
      }

      await loadGoals();
    } catch (error) {
      console.error('Error creating/updating goal:', error);
      Alert.alert('エラー', '目標の保存に失敗しました');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowCreateModal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      dispatch(deleteGoal(goalId));
      await GoalDatabase.deleteGoal(goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('エラー', '目標の削除に失敗しました');
    }
  };

  const handlePauseGoal = async (goalId: string) => {
    try {
      dispatch(pauseGoal(goalId));
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        await GoalDatabase.saveGoal({ ...goal, status: 'paused' });
      }
    } catch (error) {
      console.error('Error pausing goal:', error);
      Alert.alert('エラー', '目標の一時停止に失敗しました');
    }
  };

  const handleResumeGoal = async (goalId: string) => {
    try {
      dispatch(resumeGoal(goalId));
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        await GoalDatabase.saveGoal({ ...goal, status: 'active' });
      }
    } catch (error) {
      console.error('Error resuming goal:', error);
      Alert.alert('エラー', '目標の再開に失敗しました');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingGoal(undefined);
  };

  const getFilteredGoals = () => {
    switch (selectedTab) {
      case 'active':
        return goals.filter(g => g.status === 'active' || g.status === 'paused');
      case 'completed':
        return goals.filter(g => g.status === 'completed' || g.status === 'failed');
      case 'all':
      default:
        return goals;
    }
  };

  const filteredGoals = getFilteredGoals();
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>目標設定</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 統計カード */}
        <View style={styles.statsSection}>
          <StatsCard
            title="アクティブ目標"
            value={activeGoalsCount.toString()}
            icon="target"
            color="#4CAF50"
            subtitle="進行中"
          />
          <StatsCard
            title="達成率"
            value={formatPercentage(statistics.goalsSuccessRate)}
            icon="chart-line"
            color="#2196F3"
            subtitle={`${completedGoalsCount}/${statistics.totalGoalsCreated} 達成`}
          />
          <StatsCard
            title="連続達成"
            value={`${statistics.currentStreak}回`}
            icon="fire"
            color="#FF9800"
            subtitle={`最高: ${statistics.bestStreak}回`}
          />
        </View>

        {/* アクティブゴール概要 */}
        {Object.entries(activeGoals).some(([_, goal]) => goal !== null) && (
          <View style={styles.activeGoalsSection}>
            <Text style={styles.sectionTitle}>現在の目標</Text>
            {Object.entries(activeGoals).map(([type, goal]) => {
              if (!goal) return null;
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const typeConfig = {
                daily: { title: '日次', color: '#FF6B6B' },
                weekly: { title: '週次', color: '#4ECDC4' },
                monthly: { title: '月次', color: '#45B7D1' },
              }[type as GoalType];

              return (
                <View key={type} style={styles.activeGoalSummary}>
                  <View style={styles.activeGoalHeader}>
                    <Text style={[styles.activeGoalType, { color: typeConfig.color }]}>
                      {typeConfig.title}
                    </Text>
                    <Text style={styles.activeGoalAmount}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={Math.max(0, Math.min(100, progress))}
                    color={progress >= 100 ? '#4CAF50' : typeConfig.color}
                    height={6}
                  />
                  <Text style={styles.activeGoalProgress}>
                    {formatPercentage(progress)} 達成
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* タブ */}
        <View style={styles.tabSection}>
          {['active', 'completed', 'all'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab as typeof selectedTab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'active' ? 'アクティブ' : tab === 'completed' ? '完了済み' : '全て'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 目標リスト */}
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onPause={handlePauseGoal}
              onResume={handleResumeGoal}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="target-variant" size={64} color="#666" />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'active'
                ? 'アクティブな目標がありません'
                : selectedTab === 'completed'
                ? '完了した目標がありません'
                : '目標がありません'}
            </Text>
            <Text style={styles.emptySubtitle}>
              新しい目標を作成してトレーディングを始めましょう
            </Text>
            {selectedTab === 'active' && (
              <TouchableOpacity
                style={styles.createFirstGoalButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstGoalText}>最初の目標を作成</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <CreateGoalModal
        visible={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateGoal}
        editingGoal={editingGoal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTextContent: {
    flex: 1,
  },
  statsTitle: {
    color: '#B0B0B0',
    fontSize: 12,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsSubtitle: {
    color: '#666',
    fontSize: 10,
  },
  activeGoalsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeGoalSummary: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  activeGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeGoalType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeGoalAmount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeGoalProgress: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createFirstGoalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  createFirstGoalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});