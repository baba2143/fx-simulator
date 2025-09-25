import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Trade } from '../../types';

interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  averageProfit: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeDuration: number; // in hours
}

interface PerformanceAnalyticsProps {
  trades: Trade[];
  initialBalance: number;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  trades,
  initialBalance,
}) => {
  const accountData = useSelector((state: RootState) => state.account.data);
  const balance = accountData?.balance || initialBalance;

  const statistics = useMemo((): TradeStatistics => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgTradeDuration: 0,
      };
    }

    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.profit != null);

    if (closedTrades.length === 0) {
      return {
        totalTrades: trades.length,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgTradeDuration: 0,
      };
    }

    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.profit || 0) < 0);
    const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const totalLossAmount = Math.abs(
      losingTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0),
    );

    // 最大ドローダウンの計算
    let maxDrawdown = 0;
    let peak = initialBalance;
    let runningBalance = initialBalance;

    closedTrades.forEach(trade => {
      runningBalance += trade.profit || 0;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = ((peak - runningBalance) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // 連続勝敗の計算
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentConsecutiveWins = 0;
    let currentConsecutiveLosses = 0;

    closedTrades.forEach(trade => {
      if ((trade.profit || 0) > 0) {
        currentConsecutiveWins++;
        currentConsecutiveLosses = 0;
        if (currentConsecutiveWins > maxConsecutiveWins) {
          maxConsecutiveWins = currentConsecutiveWins;
        }
      } else {
        currentConsecutiveLosses++;
        currentConsecutiveWins = 0;
        if (currentConsecutiveLosses > maxConsecutiveLosses) {
          maxConsecutiveLosses = currentConsecutiveLosses;
        }
      }
    });

    // 平均取引時間の計算（時間単位）
    const avgTradeDuration = closedTrades.reduce((sum, trade) => {
      if (trade.closeDate) {
        return sum + (trade.closeDate - trade.openDate) / (1000 * 60 * 60); // ミリ秒を時間に変換
      }
      return sum;
    }, 0) / closedTrades.length;

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / closedTrades.length) * 100,
      totalProfit,
      averageProfit: totalProfit / closedTrades.length,
      averageWin: winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0,
      profitFactor: totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0,
      maxDrawdown,
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      bestTrade: Math.max(...closedTrades.map(trade => trade.profit || 0)),
      worstTrade: Math.min(...closedTrades.map(trade => trade.profit || 0)),
      avgTradeDuration,
    };
  }, [trades, initialBalance]);

  const profitChartData = useMemo(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.profit != null);
    let runningBalance = initialBalance;

    const values = closedTrades.map((trade, index) => {
      runningBalance += trade.profit || 0;
      return { x: index, y: runningBalance };
    });

    return {
      dataSets: [{
        values,
        label: 'Balance',
        config: {
          color: statistics.totalProfit >= 0 ? '#4ECDC4' : '#FF6B6B',
          lineWidth: 3,
          drawCircles: false,
          drawValues: false,
          mode: 'LINEAR',
          fillColor: statistics.totalProfit >= 0 ? '#4ECDC4' : '#FF6B6B',
          fillAlpha: 30,
          drawFilled: true,
        },
      }],
    };
  }, [trades, initialBalance, statistics.totalProfit]);

  const winLossPieData = useMemo(() => {
    if (statistics.totalTrades === 0) return { dataSets: [] };

    return {
      dataSets: [{
        values: [
          { value: statistics.winningTrades, label: '勝ち' },
          { value: statistics.losingTrades, label: '負け' },
        ],
        label: '勝敗',
        config: {
          colors: ['#4ECDC4', '#FF6B6B'],
          valueTextSize: 14,
          valueTextColor: '#FFFFFF',
          sliceSpace: 3,
        },
      }],
    };
  }, [statistics]);

  const StatItem = ({ label, value, isPercentage = false, isCurrency = false, color }: {
    label: string;
    value: number;
    isPercentage?: boolean;
    isCurrency?: boolean;
    color?: string;
  }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, ...(color ? [{ color }] : [])]}>
        {isCurrency && '¥'}
        {isPercentage ? value.toFixed(1) + '%' : value.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>概要</Text>
        <View style={styles.overviewGrid}>
          <StatItem
            label="総取引数"
            value={statistics.totalTrades}
          />
          <StatItem
            label="勝率"
            value={statistics.winRate}
            isPercentage
            color={statistics.winRate >= 50 ? '#4ECDC4' : '#FF6B6B'}
          />
          <StatItem
            label="総損益"
            value={statistics.totalProfit}
            isCurrency
            color={statistics.totalProfit >= 0 ? '#4ECDC4' : '#FF6B6B'}
          />
          <StatItem
            label="現在残高"
            value={balance}
            isCurrency
            color={balance >= initialBalance ? '#4ECDC4' : '#FF6B6B'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>損益推移</Text>
        <View style={styles.chartContainer}>
          <LineChart
            style={styles.chart}
            data={profitChartData}
            backgroundColor="#1E1E1E"
            gridBackgroundColor="#1E1E1E"
            xAxis={{
              enabled: true,
              textColor: '#8E8E93',
              drawGridLines: false,
            }}
            yAxis={{
              left: {
                enabled: true,
                textColor: '#8E8E93',
                drawGridLines: true,
                gridColor: '#333333',
              },
              right: { enabled: false },
            }}
            legend={{ enabled: false }}
            description={{ text: '' }}
          />
        </View>
      </View>

      {statistics.totalTrades > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>勝敗分析</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              style={styles.pieChart}
              data={winLossPieData}
              backgroundColor="#1E1E1E"
              legend={{
                enabled: true,
                textColor: '#FFFFFF',
                position: 'RIGHT_OF_CHART_CENTER',
              }}
              description={{ text: '' }}
            />
          </View>

          <View style={styles.detailGrid}>
            <StatItem label="勝ち取引数" value={statistics.winningTrades} />
            <StatItem label="負け取引数" value={statistics.losingTrades} />
            <StatItem label="平均勝ち額" value={statistics.averageWin} isCurrency />
            <StatItem label="平均負け額" value={statistics.averageLoss} isCurrency />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>詳細統計</Text>
        <View style={styles.detailGrid}>
          <StatItem
            label="プロフィットファクター"
            value={statistics.profitFactor}
            color={statistics.profitFactor >= 1.5 ? '#4ECDC4' : statistics.profitFactor >= 1 ? '#FFEAA7' : '#FF6B6B'}
          />
          <StatItem
            label="最大ドローダウン"
            value={statistics.maxDrawdown}
            isPercentage
            color={statistics.maxDrawdown <= 10 ? '#4ECDC4' : statistics.maxDrawdown <= 20 ? '#FFEAA7' : '#FF6B6B'}
          />
          <StatItem label="最大連勝" value={statistics.consecutiveWins} />
          <StatItem label="最大連敗" value={statistics.consecutiveLosses} />
          <StatItem
            label="最大利益"
            value={statistics.bestTrade}
            isCurrency
            color="#4ECDC4"
          />
          <StatItem
            label="最大損失"
            value={Math.abs(statistics.worstTrade)}
            isCurrency
            color="#FF6B6B"
          />
          <StatItem
            label="平均取引時間"
            value={Math.round(statistics.avgTradeDuration)}
          />
          <StatItem
            label="平均損益"
            value={statistics.averageProfit}
            isCurrency
            color={statistics.averageProfit >= 0 ? '#4ECDC4' : '#FF6B6B'}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#48484A',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    minWidth: '45%',
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  chartContainer: {
    height: 200,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  chart: {
    flex: 1,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    height: 200,
    width: 200,
  },
});