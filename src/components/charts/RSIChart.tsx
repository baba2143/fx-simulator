import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface RSIChartProps {
  height?: number;
}

export const RSIChart: React.FC<RSIChartProps> = ({ height = 100 }) => {
  const { activeIndicators, data } = useSelector((state: RootState) => state.indicators);

  // RSIインジケーターを取得
  const rsiIndicators = activeIndicators.filter(
    indicator => indicator.visible && indicator.type === 'rsi',
  );

  if (rsiIndicators.length === 0) {
    return null;
  }

  // RSIデータを準備
  const dataSets = rsiIndicators.map(indicator => {
    const rsiData = data.rsi[indicator.id] || [];
    const values = rsiData.map((item, index) => ({
      x: index,
      y: item.rsi,
    }));

    return {
      values,
      label: `RSI(${indicator.period || 14})`,
      config: {
        color: indicator.color,
        lineWidth: 2,
        drawCircles: false,
        drawValues: false,
        mode: 'LINEAR',
      },
    };
  });

  // 水平線データ（30, 50, 70ライン）
  const horizontalLines = [
    {
      values: Array.from({ length: 100 }, (_, index) => ({ x: index, y: 30 })),
      label: 'Oversold (30)',
      config: {
        color: '#FF6B6B',
        lineWidth: 1,
        drawCircles: false,
        drawValues: false,
        enableDashedLine: true,
        dashedLine: {
          lineLength: 5,
          spaceLength: 5,
        },
      },
    },
    {
      values: Array.from({ length: 100 }, (_, index) => ({ x: index, y: 50 })),
      label: 'Middle (50)',
      config: {
        color: '#8E8E93',
        lineWidth: 1,
        drawCircles: false,
        drawValues: false,
        enableDashedLine: true,
        dashedLine: {
          lineLength: 3,
          spaceLength: 3,
        },
      },
    },
    {
      values: Array.from({ length: 100 }, (_, index) => ({ x: index, y: 70 })),
      label: 'Overbought (70)',
      config: {
        color: '#4ECDC4',
        lineWidth: 1,
        drawCircles: false,
        drawValues: false,
        enableDashedLine: true,
        dashedLine: {
          lineLength: 5,
          spaceLength: 5,
        },
      },
    },
  ];

  const chartConfig = {
    backgroundColor: '#1E1E1E',
    gridBackgroundColor: '#1E1E1E',

    xAxis: {
      enabled: true,
      drawGridLines: false,
      textColor: '#8E8E93',
      position: 'BOTTOM',
    },

    yAxis: {
      left: {
        enabled: true,
        drawGridLines: true,
        gridColor: '#333333',
        textColor: '#8E8E93',
        axisMinimum: 0,
        axisMaximum: 100,
        granularity: 10,
        granularityEnabled: true,
      },
      right: {
        enabled: false,
      },
    },

    legend: {
      enabled: true,
      textColor: '#FFFFFF',
      position: 'BELOW_CHART_LEFT',
    },

    description: {
      text: '',
    },

    touchEnabled: false,
    dragEnabled: false,
    scaleEnabled: false,
    pinchZoom: false,
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.header}>
        <Text style={styles.title}>RSI</Text>
        {rsiIndicators.map(indicator => {
          const latestRSI = data.rsi[indicator.id]?.slice(-1)[0]?.rsi;
          return (
            <Text key={indicator.id} style={[styles.value, { color: indicator.color }]}>
              {latestRSI ? latestRSI.toFixed(2) : '--'}
            </Text>
          );
        })}
      </View>
      <LineChart
        style={styles.chart}
        data={{ dataSets: [...dataSets, ...horizontalLines] }}
        {...chartConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#48484A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  chart: {
    flex: 1,
  },
});