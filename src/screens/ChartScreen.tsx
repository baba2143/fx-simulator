import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPriceData, setCurrentPair } from '../store/slices/priceSlice';
import { setSelectedPair, setChartData } from '../store/slices/chartSlice';
import {
  setSMAData,
  setEMAData,
  setRSIData,
} from '../store/slices/indicatorSlice';
import { CurrencyPair } from '../types';
import { CandlestickChart } from '../components/charts/CandlestickChart';
import { TimeframeSelector } from '../components/charts/TimeframeSelector';
import { IndicatorOverlay } from '../components/charts/IndicatorOverlay';
import { RSIChart } from '../components/charts/RSIChart';
import { IndicatorSettings } from '../components/charts/IndicatorSettings';
import { DrawingToolbar } from '../components/charts/DrawingToolbar';
import { calculateSMA, calculateEMA, calculateRSI } from '../utils/technicalIndicators';
import { generateTradingSignals, analyzeMarketCondition } from '../utils/marketAnalysis';

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
  const { activeIndicators } = useSelector((state: RootState) => state.indicators);

  const [showIndicatorSettings, setShowIndicatorSettings] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [marketCondition, setMarketCondition] = useState<any>(null);

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
      calculateIndicators();
      analyzeMarket();
    }
  }, [priceData, dispatch]);

  const calculateIndicators = () => {
    if (!priceData || priceData.length === 0) return;

    // 各アクティブなインジケーターの計算
    activeIndicators.forEach(indicator => {
      if (!indicator.visible) return;

      try {
        switch (indicator.type) {
          case 'sma':
            if (indicator.period) {
              const smaData = calculateSMA(priceData, indicator.period);
              dispatch(setSMAData({ id: indicator.id, data: smaData }));
            }
            break;
          case 'ema':
            if (indicator.period) {
              const emaData = calculateEMA(priceData, indicator.period);
              dispatch(setEMAData({ id: indicator.id, data: emaData }));
            }
            break;
          case 'rsi':
            if (indicator.period) {
              const rsiData = calculateRSI(priceData, indicator.period);
              dispatch(setRSIData({ id: indicator.id, data: rsiData }));
            }
            break;
        }
      } catch (error) {
        console.warn(`Error calculating ${indicator.type}:`, error);
      }
    });
  };

  const analyzeMarket = () => {
    if (!priceData || priceData.length < 20) return;

    try {
      const condition = analyzeMarketCondition(priceData);
      const tradingSignals = generateTradingSignals(priceData);

      setMarketCondition(condition);
      setSignals(tradingSignals.slice(0, 3)); // 上位3つのシグナル
    } catch (error) {
      console.warn('Error analyzing market:', error);
    }
  };

  useEffect(() => {
    calculateIndicators();
  }, [activeIndicators]);

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

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => setShowIndicatorSettings(true)}
      >
        <Text style={styles.toolbarButtonText}>📊 インジケーター</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => setShowDrawingTools(true)}
      >
        <Text style={styles.toolbarButtonText}>✏️ 描画</Text>
      </TouchableOpacity>

      {marketCondition && (
        <View style={styles.marketInfo}>
          <Text style={[styles.marketText, { color: getTrendColor(marketCondition.trend) }]}>
            {getTrendLabel(marketCondition.trend)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSignals = () => {
    if (signals.length === 0) return null;

    return (
      <View style={styles.signalsContainer}>
        <Text style={styles.signalsTitle}>トレードシグナル</Text>
        {signals.map((signal, index) => (
          <View key={index} style={[styles.signalItem, { borderLeftColor: getSignalColor(signal.type) }]}>
            <Text style={[styles.signalType, { color: getSignalColor(signal.type) }]}>
              {signal.type.toUpperCase()}
            </Text>
            <Text style={styles.signalReason}>{signal.reason}</Text>
            <Text style={styles.signalConfidence}>信頼度: {signal.confidence.toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    );
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return '#4ECDC4';
      case 'bearish': return '#FF6B6B';
      default: return '#8E8E93';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'bullish': return '上昇トレンド';
      case 'bearish': return '下降トレンド';
      default: return '横ばい';
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return '#4ECDC4';
      case 'sell': return '#FF6B6B';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      {renderPairSelector()}
      <TimeframeSelector />
      {renderToolbar()}
      {renderChartSection()}
      {activeIndicators.some(ind => ind.visible && ind.type === 'rsi') && <RSIChart height={120} />}
      {renderSignals()}

      <IndicatorSettings
        visible={showIndicatorSettings}
        onClose={() => setShowIndicatorSettings(false)}
      />
      <DrawingToolbar
        visible={showDrawingTools}
        onClose={() => setShowDrawingTools(false)}
      />
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
    gap: 12,
  },
  toolbarButton: {
    backgroundColor: '#3C3C3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toolbarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  marketInfo: {
    marginLeft: 'auto',
  },
  marketText: {
    fontSize: 12,
    fontWeight: '600',
  },
  signalsContainer: {
    backgroundColor: '#2C2C2E',
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  signalsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  signalItem: {
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  signalType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  signalReason: {
    color: '#FFFFFF',
    fontSize: 11,
    marginBottom: 2,
  },
  signalConfidence: {
    color: '#8E8E93',
    fontSize: 10,
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
