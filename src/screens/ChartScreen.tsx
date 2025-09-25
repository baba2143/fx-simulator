import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchPriceData, setCurrentPair } from '../store/slices/priceSlice';
import { CurrencyPair, TimeFrame } from '../types';

const CURRENCY_PAIRS: CurrencyPair[] = ['USDJPY', 'EURUSD', 'EURJPY', 'GBPUSD', 'GBPJPY', 'AUDJPY'];
const TIME_FRAMES: TimeFrame[] = ['1H', '4H', '1D'];

export const ChartScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: priceData, currentPair, loading, error } = useAppSelector(state => state.price);

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1D');

  useEffect(() => {
    loadChartData();
  }, [currentPair, dispatch]);

  const loadChartData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // 30日間のデータ

      await dispatch(
        fetchPriceData({
          pair: currentPair,
          startDate,
          endDate,
        }),
      ).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to load chart data');
    }
  };

  const handlePairChange = (pair: CurrencyPair) => {
    dispatch(setCurrentPair(pair));
  };

  const renderPairSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pairSelector}>
      {CURRENCY_PAIRS.map(pair => (
        <TouchableOpacity
          key={pair}
          style={[styles.pairButton, pair === currentPair && styles.activePairButton]}
          onPress={() => handlePairChange(pair)}>
          <Text
            style={[styles.pairButtonText, pair === currentPair && styles.activePairButtonText]}>
            {pair}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTimeFrameSelector = () => (
    <View style={styles.timeFrameContainer}>
      {TIME_FRAMES.map(timeFrame => (
        <TouchableOpacity
          key={timeFrame}
          style={[
            styles.timeFrameButton,
            timeFrame === selectedTimeFrame && styles.activeTimeFrameButton,
          ]}
          onPress={() => setSelectedTimeFrame(timeFrame)}>
          <Text
            style={[
              styles.timeFrameButtonText,
              timeFrame === selectedTimeFrame && styles.activeTimeFrameButtonText,
            ]}>
            {timeFrame}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartPlaceholder = () => (
    <View style={styles.chartContainer}>
      {loading ? (
        <Text style={styles.loadingText}>Loading chart data...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : priceData.length > 0 ? (
        <>
          <Text style={styles.chartTitle}>{currentPair} Chart</Text>
          <Text style={styles.dataCount}>Data points: {priceData.length}</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>
              Chart will be implemented with react-native-charts-wrapper
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderPairSelector()}
      {renderTimeFrameSelector()}
      {renderChartPlaceholder()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pairSelector: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  pairButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activePairButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pairButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  activePairButtonText: {
    color: '#FFFFFF',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeTimeFrameButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeFrameButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  activeTimeFrameButtonText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    flex: 1,
    padding: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  dataCount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007AFF',
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 50,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 50,
  },
});
