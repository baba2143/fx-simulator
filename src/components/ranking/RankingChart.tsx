import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-charts-wrapper';
import { PerformanceMetrics, RankingPeriod } from '../../store/slices/rankingSlice';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface RankingChartProps {
  metricsHistory: { period: RankingPeriod; metrics: PerformanceMetrics | null }[];
  selectedPeriod: RankingPeriod;
  onPeriodChange: (period: RankingPeriod) => void;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 220;

const PERIOD_COLORS: { [key in RankingPeriod]: string } = {
  daily: '#FF6B6B',
  weekly: '#4ECDC4',
  monthly: '#45B7D1',
  yearly: '#96CEB4',
  'all-time': '#FFEAA7',
};

const PERIOD_LABELS = {
  daily: '日次',
  weekly: '週次',
  monthly: '月次',
  yearly: '年次',
  'all-time': '全期間',
};

export const RankingChart: React.FC<RankingChartProps> = ({
  metricsHistory,
  selectedPeriod,
  onPeriodChange,
}) => {
  const validMetrics = metricsHistory.filter(item => item.metrics !== null);

  if (validMetrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-line" size={48} color="#666" />
        <Text style={styles.emptyTitle}>データがありません</Text>
        <Text style={styles.emptySubtitle}>
          取引を開始するとパフォーマンスチャートが表示されます
        </Text>
      </View>
    );
  }

  // チャートデータを準備
  const chartData = {
    dataSets: [
      {
        values: validMetrics.map((item, index) => ({
          x: index,
          y: item.metrics!.totalProfit,
        })),
        label: '累積利益',
        config: {
          color: PERIOD_COLORS[selectedPeriod],
          lineWidth: 3,
          drawCircles: true,
          drawValues: false,
          mode: 'CUBIC_BEZIER',
          drawFilled: true,
          fillColor: PERIOD_COLORS[selectedPeriod],
          fillAlpha: 30,
        },
      },
    ],
  };

  const selectedMetrics = validMetrics.find(item => item.period === selectedPeriod)?.metrics;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>パフォーマンス推移</Text>
        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodButtons}>
              {Object.entries(PERIOD_LABELS).map(([period, label]) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && {
                      backgroundColor: PERIOD_COLORS[period as RankingPeriod],
                    },
                  ]}
                  onPress={() => onPeriodChange(period as RankingPeriod)}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.selectedPeriodText,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          style={{ height: CHART_HEIGHT }}
          data={chartData}
          xAxis={{
            enabled: true,
            drawGridLines: false,
            gridColor: '#333',
            textColor: '#B0B0B0',
            position: 'BOTTOM',
          }}
          yAxis={{
            left: {
              enabled: true,
              drawGridLines: true,
              gridColor: '#333',
              textColor: '#B0B0B0',
            },
            right: {
              enabled: false,
            },
          }}
          legend={{
            enabled: false,
          }}
          description={{
            text: '',
          }}
          backgroundColor="#0A0A0A"
          scaleEnabled={true}
          dragEnabled={true}
          pinchZoom={true}
        />
      </View>

      {selectedMetrics && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{formatCurrency(selectedMetrics.totalProfit)}</Text>
            <Text style={styles.statLabel}>累積利益</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="target" size={20} color="#2196F3" />
            <Text style={styles.statValue}>{formatPercentage(selectedMetrics.winRate)}</Text>
            <Text style={styles.statLabel}>勝率</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="calculator-variant" size={20} color="#FF9800" />
            <Text style={styles.statValue}>{selectedMetrics.profitFactor.toFixed(2)}</Text>
            <Text style={styles.statLabel}>PF</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="chart-line-variant" size={20} color="#9C27B0" />
            <Text style={styles.statValue}>{selectedMetrics.consistencyScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>一貫性</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  periodSelector: {
    marginTop: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
  },
  periodButtonText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: '#FFF',
  },
  chartContainer: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#B0B0B0',
    fontSize: 10,
  },
  emptyContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    margin: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
