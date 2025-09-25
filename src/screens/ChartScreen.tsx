import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPriceData, setCurrentPair } from '../store/slices/priceSlice';
import { setSelectedPair, setChartData } from '../store/slices/chartSlice';
import { CurrencyPair } from '../types';
import { CandlestickChart } from '../components/charts/CandlestickChart';
import { TimeframeSelector } from '../components/charts/TimeframeSelector';

const CURRENCY_PAIRS: CurrencyPair[] = ['USDJPY', 'EURUSD', 'EURJPY', 'GBPUSD', 'GBPJPY', 'AUDJPY'];

export const ChartScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: priceData,
    currentPair,
    loading: priceLoading,
    error: priceError,
  } = useSelector((state: RootState) => state.price);
  const {
    selectedPair,
    chartData,
    timeframe,
    loading: chartLoading,
  } = useSelector((state: RootState) => state.chart);

  useEffect(() => {
    const loadData = async () => {
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

    // Sync chart selected pair with price current pair
    if (selectedPair !== currentPair) {
      dispatch(setSelectedPair(currentPair));
    }
    loadData();
  }, [currentPair, selectedPair, timeframe, dispatch]);

  useEffect(() => {
    // Update chart data when price data changes
    if (priceData && priceData.length > 0) {
      dispatch(setChartData(priceData));
    }
  }, [priceData, dispatch]);

  const handlePairChange = (pair: CurrencyPair) => {
    dispatch(setCurrentPair(pair));
    dispatch(setSelectedPair(pair));
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

  const renderChartSection = () => {
    const loading = priceLoading || chartLoading;
    const error = priceError;

    if (loading) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{selectedPair}</Text>
          <Text style={styles.dataCount}>Data points: {chartData.length}</Text>
        </View>
        <CandlestickChart data={chartData} height={300} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderPairSelector()}
      <TimeframeSelector />
      {renderChartSection()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  pairSelector: {
    padding: 16,
    backgroundColor: '#2C2C2E',
  },
  pairButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#3C3C3E',
    borderWidth: 1,
    borderColor: '#48484A',
  },
  activePairButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pairButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  activePairButtonText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    flex: 1,
  },
  chartHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#48484A',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dataCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007AFF',
    marginTop: 100,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 100,
  },
});
