import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchClosedTrades } from '../store/slices/tradeSlice';
import { Trade } from '../types';

export const HistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { closedTrades, loading } = useAppSelector(state => state.trade);

  useEffect(() => {
    dispatch(fetchClosedTrades());
  }, [dispatch]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatProfit = (profit: number) => {
    const isPositive = profit >= 0;
    return {
      text: `${isPositive ? '+' : ''}¥${profit.toLocaleString()}`,
      color: isPositive ? '#34C759' : '#FF3B30',
    };
  };

  const renderTradeItem = ({ item }: { item: Trade }) => {
    const profit = formatProfit(item.profit || 0);

    return (
      <TouchableOpacity style={styles.tradeItem}>
        <View style={styles.tradeHeader}>
          <Text style={styles.currencyPair}>{item.currencyPair}</Text>
          <Text style={[styles.profit, { color: profit.color }]}>{profit.text}</Text>
        </View>

        <View style={styles.tradeDetails}>
          <View style={styles.tradeTypeContainer}>
            <Text
              style={[
                styles.tradeType,
                item.tradeType === 'buy' ? styles.buyType : styles.sellType,
              ]}>
              {item.tradeType.toUpperCase()}
            </Text>
            <Text style={styles.amount}>{item.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Open: {item.openPrice}</Text>
            <Text style={styles.priceLabel}>Close: {item.closePrice}</Text>
          </View>
        </View>

        <View style={styles.tradeFooter}>
          <Text style={styles.date}>
            {formatDate(item.openDate)} - {item.closeDate ? formatDate(item.closeDate) : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => {
    if (closedTrades.length === 0) return null;

    const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0).length;
    const winRate = ((winningTrades / closedTrades.length) * 100).toFixed(1);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{closedTrades.length}</Text>
          <Text style={styles.statLabel}>Total Trades</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: totalProfit >= 0 ? '#34C759' : '#FF3B30' }]}>
            ¥{totalProfit.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total P&L</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No trade history available</Text>
      <Text style={styles.emptySubtext}>Start trading to see your transaction history here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStats()}

      {closedTrades.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={closedTrades}
          renderItem={renderTradeItem}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={() => dispatch(fetchClosedTrades())}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  tradeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyPair: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  profit: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tradeTypeContainer: {
    alignItems: 'flex-start',
  },
  tradeType: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyType: {
    backgroundColor: '#34C759',
    color: '#FFFFFF',
  },
  sellType: {
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
  },
  amount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  tradeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#999999',
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
