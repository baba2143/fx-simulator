import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface IndicatorOverlayProps {
  height: number;
}

export const IndicatorOverlay: React.FC<IndicatorOverlayProps> = ({ height }) => {
  const { activeIndicators, data } = useSelector((state: RootState) => state.indicators);
  const { chartData } = useSelector((state: RootState) => state.chart);

  // 表示可能なライン系インジケーターを取得
  const visibleLineIndicators = activeIndicators.filter(
    indicator => indicator.visible && ['sma', 'ema'].includes(indicator.type),
  );

  if (visibleLineIndicators.length === 0 || chartData.length === 0) {
    return null;
  }

  // チャートデータを準備
  const dataSets = visibleLineIndicators.map(indicator => {
    let values: Array<{ x: number; y: number }> = [];

    if (indicator.type === 'sma' && data.sma[indicator.id]) {
      values = data.sma[indicator.id].map((item, index) => ({
        x: index,
        y: item.value,
      }));
    } else if (indicator.type === 'ema' && data.ema[indicator.id]) {
      values = data.ema[indicator.id].map((item, index) => ({
        x: index,
        y: item.value,
      }));
    }

    return {
      values,
      label: `${indicator.type.toUpperCase()}${indicator.period || ''}`,
      config: {
        color: indicator.color,
        lineWidth: 2,
        drawCircles: false,
        drawValues: false,
        mode: 'LINEAR',
      },
    };
  });

  const chartConfig = {
    backgroundColor: 'transparent',
    gridBackgroundColor: 'transparent',

    xAxis: {
      enabled: false,
    },

    yAxis: {
      left: {
        enabled: false,
      },
      right: {
        enabled: false,
      },
    },

    legend: {
      enabled: false,
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
      <LineChart style={styles.chart} data={{ dataSets }} {...chartConfig} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  chart: {
    flex: 1,
  },
});
