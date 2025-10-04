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
  RankingPeriod,
  RankingCategory,
  PersonalRecord,
  PerformanceMetrics,
  addPersonalRecord,
  setCurrentMetrics,
  setPeriodComparison,
  initializeRanking,
  clearAchievements,
} from '../store/slices/rankingSlice';
import { PersonalRecordCard } from '../components/ranking/PersonalRecordCard';
import { RankingChart } from '../components/ranking/RankingChart';
import { RankingDatabase } from '../utils/rankingDatabase';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const { width } = Dimensions.get('window');

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  improvement?: string;
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  improvement,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.statsCard, { borderLeftColor: color }]}
    onPress={onPress}
    disabled={!onPress}>
    <View style={styles.statsContent}>
      <View style={styles.statsTextContent}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={[styles.statsValue, { color }]}>{value}</Text>
        {improvement && <Text style={styles.improvementText}>{improvement}</Text>}
      </View>
      <Icon name={icon} size={32} color={color} />
    </View>
  </TouchableOpacity>
);

export const RankingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { personalRecords, currentMetrics, comparisonData, achievements } = useSelector(
    (state: RootState) => state.ranking,
  );
  const { balance, totalProfit } = useSelector((state: RootState) => state.account.data || {});

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<RankingCategory>('profit');

  useEffect(() => {
    initializeDatabase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRankingData();
      calculateCurrentMetrics();
    }, []),
  );

  const initializeDatabase = async () => {
    try {
      await RankingDatabase.initializeTables();
    } catch (error) {
      console.error('Error initializing ranking database:', error);
      Alert.alert('エラー', 'データベースの初期化に失敗しました');
    }
  };

  const loadRankingData = async () => {
    try {
      const [records, metrics] = await Promise.all([
        RankingDatabase.loadPersonalRecords(),
        RankingDatabase.loadPerformanceMetrics(),
      ]);

      dispatch(initializeRanking({ records, metrics }));
    } catch (error) {
      console.error('Error loading ranking data:', error);
      Alert.alert('エラー', 'ランキングデータの読み込みに失敗しました');
    }
  };

  const calculateCurrentMetrics = async () => {
    // 現在のパフォーマンスメトリクスを計算
    // ここでは実際の取引データから計算する代わりに、サンプルデータを使用
    const metrics: PerformanceMetrics = {
      totalProfit: totalProfit || 0,
      winRate: 65.5, // TODO: 実際の勝率を計算
      profitFactor: 1.35, // TODO: 実際のプロフィットファクターを計算
      sharpeRatio: 0.85, // TODO: 実際のシャープレシオを計算
      maxDrawdown: -5.2, // TODO: 実際の最大ドローダウンを計算
      consistencyScore: 72.8, // TODO: 実際の一貫性スコアを計算
      averageRiskReward: 1.8, // TODO: 実際のリスクリワード比を計算
      tradesCount: 24, // TODO: 実際の取引数を取得
      period: selectedPeriod,
      calculatedAt: Date.now(),
    };

    dispatch(setCurrentMetrics({ period: selectedPeriod, metrics }));

    // 新記録をチェック
    await checkForNewRecords(metrics);
  };

  const checkForNewRecords = async (metrics: PerformanceMetrics) => {
    try {
      const categories: { category: RankingCategory; value: number; description: string }[] = [
        {
          category: 'profit',
          value: metrics.totalProfit,
          description: `${selectedPeriod}の累積利益記録`,
        },
        { category: 'winRate', value: metrics.winRate, description: `${selectedPeriod}の勝率記録` },
        {
          category: 'profitFactor',
          value: metrics.profitFactor,
          description: `${selectedPeriod}のプロフィットファクター記録`,
        },
        {
          category: 'consistency',
          value: metrics.consistencyScore,
          description: `${selectedPeriod}の一貫性スコア記録`,
        },
        {
          category: 'riskReward',
          value: metrics.averageRiskReward,
          description: `${selectedPeriod}のリスクリワード比記録`,
        },
      ];

      for (const { category, value, description } of categories) {
        const existingRecord = await RankingDatabase.getBestRecordForCategory(
          category,
          selectedPeriod,
        );

        if (!existingRecord || value > existingRecord.value) {
          const record: Omit<PersonalRecord, 'id'> = {
            category,
            value,
            achievedAt: Date.now(),
            period: selectedPeriod,
            description,
            previousBest: existingRecord?.value,
            improvement: existingRecord
              ? ((value - existingRecord.value) / existingRecord.value) * 100
              : 100,
            metadata: {
              tradesCount: metrics.tradesCount,
            },
          };

          dispatch(addPersonalRecord(record));
          await RankingDatabase.savePersonalRecord({
            ...record,
            id: `record_${Date.now()}_${category}`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking for new records:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankingData();
    await calculateCurrentMetrics();
    setRefreshing(false);
  };

  const handleRecordPress = (record: PersonalRecord) => {
    Alert.alert(
      '個人記録詳細',
      `${record.description}\n\n` +
        `達成日: ${new Date(record.achievedAt).toLocaleDateString('ja-JP')}\n` +
        (record.previousBest ? `前回記録: ${record.previousBest}\n` : '') +
        (record.improvement ? `向上率: +${record.improvement.toFixed(1)}%` : ''),
      [{ text: 'OK' }],
    );
  };

  const handleClearAchievements = () => {
    dispatch(clearAchievements());
  };

  // 最新の記録を取得
  const latestRecords = personalRecords.slice(0, 3);
  const currentPeriodMetrics = currentMetrics[selectedPeriod];

  // 統計データを準備
  const totalRecordsCount = personalRecords.length;
  const recordsThisMonth = personalRecords.filter(
    record => record.achievedAt > Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).length;
  const bestCategory = personalRecords.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  const mostActiveCategory =
    Object.keys(bestCategory).length > 0
      ? Object.keys(bestCategory).reduce((a, b) => (bestCategory[a] > bestCategory[b] ? a : b))
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ランキング・記録</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* アチーブメント通知 */}
        {(achievements.newRecord || achievements.rankImprovement) && (
          <View style={styles.achievementBanner}>
            <Icon name="trophy" size={24} color="#FFD700" />
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>新記録達成！</Text>
              <Text style={styles.achievementText}>
                {achievements.newRecord && '新しい個人記録を達成しました！'}
                {achievements.rankImprovement && 'ランクが向上しました！'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearAchievements}>
              <Icon name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* 統計概要 */}
        <View style={styles.statsSection}>
          <StatsCard
            title="総記録数"
            value={totalRecordsCount.toString()}
            icon="trophy-variant"
            color="#FFD700"
            improvement={recordsThisMonth > 0 ? `今月+${recordsThisMonth}件` : undefined}
          />
          <StatsCard
            title="最高勝率"
            value={currentPeriodMetrics ? formatPercentage(currentPeriodMetrics.winRate) : '0%'}
            icon="target"
            color="#2196F3"
          />
          <StatsCard
            title="累積利益"
            value={currentPeriodMetrics ? formatCurrency(currentPeriodMetrics.totalProfit) : '¥0'}
            icon="trending-up"
            color="#4CAF50"
          />
        </View>

        {/* パフォーマンスチャート */}
        <RankingChart
          metricsHistory={comparisonData.periodComparison}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* 最新の記録 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最新の個人記録</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>すべて表示</Text>
              <Icon name="chevron-right" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {latestRecords.length > 0 ? (
            latestRecords.map((record, index) => (
              <PersonalRecordCard
                key={record.id}
                record={record}
                isLatest={index === 0}
                onPress={handleRecordPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="trophy-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>記録がありません</Text>
              <Text style={styles.emptySubtitle}>取引を続けて個人記録を作成しましょう</Text>
            </View>
          )}
        </View>

        {/* カテゴリ別ランキング */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリ別パフォーマンス</Text>
          <View style={styles.categoryGrid}>
            {(['profit', 'winRate', 'profitFactor', 'consistency'] as RankingCategory[]).map(
              category => {
                const record = personalRecords.find(
                  r => r.category === category && r.period === selectedPeriod,
                );
                const isSelected = selectedCategory === category;

                const categoryConfig = {
                  profit: { icon: 'trending-up', title: '利益', color: '#4CAF50' },
                  winRate: { icon: 'target', title: '勝率', color: '#2196F3' },
                  profitFactor: { icon: 'calculator-variant', title: 'PF', color: '#FF9800' },
                  consistency: { icon: 'chart-line-variant', title: '一貫性', color: '#9C27B0' },
                }[category];

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: categoryConfig.color },
                    ]}
                    onPress={() => setSelectedCategory(category)}>
                    <Icon name={categoryConfig.icon} size={24} color={categoryConfig.color} />
                    <Text style={styles.categoryTitle}>{categoryConfig.title}</Text>
                    <Text style={styles.categoryValue}>
                      {record ? record.value.toFixed(category === 'winRate' ? 1 : 2) : '---'}
                    </Text>
                    {record && record.improvement && (
                      <Text style={styles.categoryImprovement}>
                        +{record.improvement.toFixed(1)}%
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>
      </ScrollView>
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
  refreshButton: {
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
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70030',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  improvementText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  categoryValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  categoryImprovement: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
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
});
