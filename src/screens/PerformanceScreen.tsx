import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchClosedTrades } from '../store/slices/tradeSlice';
import { fetchAccount } from '../store/slices/accountSlice';

export const PerformanceScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { closedTrades } = useAppSelector(state => state.trade);
  const { data: account } = useAppSelector(state => state.account);

  useEffect(() => {
    dispatch(fetchClosedTrades());
    dispatch(fetchAccount());
  }, [dispatch]);

  const statistics = useMemo(() => {
    if (closedTrades.length === 0 || !account) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitLossRatio: 0,
        currentBalance: account?.balance || 0,
        initialBalance: account?.initialBalance || 0,
        returnPercentage: 0,
      };
    }

    const profits = closedTrades.map(trade => trade.profit || 0);
    const winningTrades = profits.filter(profit => profit > 0);
    const losingTrades = profits.filter(profit => profit < 0);

    const totalProfit = winningTrades.reduce((sum, profit) => sum + profit, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, loss) => sum + loss, 0));
    const netProfit = totalProfit - totalLoss;

    const currentBalance = account.balance;
    const initialBalance = account.initialBalance;
    const returnPercentage = ((currentBalance - initialBalance) / initialBalance) * 100;

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / closedTrades.length) * 100,
      totalProfit,
      totalLoss,
      netProfit,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades) : 0,
      largestLoss: losingTrades.length > 0 ? Math.abs(Math.min(...losingTrades)) : 0,
      profitLossRatio:
        losingTrades.length > 0
          ? totalProfit / winningTrades.length / (totalLoss / losingTrades.length)
          : 0,
      currentBalance,
      initialBalance,
      returnPercentage,
    };
  }, [closedTrades, account]);

  const renderStatCard = (title: string, value: string | number, color?: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </View>
  );

  const renderBalanceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Overview</Text>
      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.currentBalance}>¥{statistics.currentBalance.toLocaleString()}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Initial Balance</Text>
          <Text style={styles.initialBalance}>¥{statistics.initialBalance.toLocaleString()}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Return</Text>
          <Text
            style={[
              styles.returnPercentage,
              { color: statistics.returnPercentage >= 0 ? '#34C759' : '#FF3B30' },
            ]}>
            {statistics.returnPercentage >= 0 ? '+' : ''}
            {statistics.returnPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTradeStatistics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trade Statistics</Text>
      <View style={styles.statsGrid}>
        {renderStatCard('Total Trades', statistics.totalTrades)}
        {renderStatCard('Winning Trades', statistics.winningTrades, '#34C759')}
        {renderStatCard('Losing Trades', statistics.losingTrades, '#FF3B30')}
        {renderStatCard('Win Rate', `${statistics.winRate.toFixed(1)}%`)}
      </View>
    </View>
  );

  const renderProfitLossAnalysis = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profit & Loss Analysis</Text>
      <View style={styles.statsGrid}>
        {renderStatCard('Total Profit', `¥${statistics.totalProfit.toLocaleString()}`, '#34C759')}
        {renderStatCard('Total Loss', `¥${statistics.totalLoss.toLocaleString()}`, '#FF3B30')}
        {renderStatCard(
          'Net Profit',
          `¥${statistics.netProfit.toLocaleString()}`,
          statistics.netProfit >= 0 ? '#34C759' : '#FF3B30',
        )}
        {renderStatCard('Profit Factor', statistics.profitFactor.toFixed(2))}
      </View>
    </View>
  );

  const renderDetailedStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detailed Statistics</Text>
      <View style={styles.statsGrid}>
        {renderStatCard('Average Win', `¥${statistics.averageWin.toLocaleString()}`)}
        {renderStatCard('Average Loss', `¥${statistics.averageLoss.toLocaleString()}`)}
        {renderStatCard('Largest Win', `¥${statistics.largestWin.toLocaleString()}`, '#34C759')}
        {renderStatCard('Largest Loss', `¥${statistics.largestLoss.toLocaleString()}`, '#FF3B30')}
      </View>
    </View>
  );

  if (statistics.totalTrades === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No trading data available</Text>
        <Text style={styles.emptySubtext}>Start trading to see your performance statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderBalanceSection()}
      {renderTradeStatistics()}
      {renderProfitLossAnalysis()}
      {renderDetailedStats()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  balanceContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  balanceItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  currentBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  initialBalance: {
    fontSize: 16,
    color: '#333333',
  },
  returnPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },
});
