import React, { useMemo } from 'react';
import { View, StyleSheet, processColor } from 'react-native';
import { CandleStickChart } from 'react-native-charts-wrapper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setZoomLevel, setPanOffset, resetChart } from '../../store/slices/chartSlice';
import { PriceData } from '../../types';

interface CandlestickChartProps {
  data: PriceData[];
  height?: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, height = 300 }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showGrid, selectedPair, timeframe } = useSelector((state: RootState) => state.chart);

  // Convert PriceData to chart format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        dataSets: [
          {
            values: [],
            label: `${selectedPair} - ${timeframe}`,
            config: {
              color: '#3366CC',
              increasingColor: '#26A69A',
              decreasingColor: '#EF5350',
              increasingPaintStyle: 'fill',
              decreasingPaintStyle: 'fill',
              shadowColor: '#333',
              shadowWidth: 1,
              showCandleBar: true,
            },
          },
        ],
      };
    }

    const values = data.map((item, index) => ({
      x: index, // Use index for x-axis
      shadowH: item.high,
      shadowL: item.low,
      open: item.open,
      close: item.close,
    }));

    return {
      dataSets: [
        {
          values,
          label: `${selectedPair} - ${timeframe}`,
          config: {
            color: '#3366CC',
            increasingColor: '#26A69A', // Green for bullish candles
            decreasingColor: '#EF5350', // Red for bearish candles
            increasingPaintStyle: 'fill',
            decreasingPaintStyle: 'fill',
            shadowColor: '#333',
            shadowWidth: 1,
            showCandleBar: true,
            barSpace: 0.1,
          },
        },
      ],
    };
  }, [data, selectedPair, timeframe]);

  // Chart configuration
  const chartConfig = {
    backgroundColor: processColor('#1E1E1E'),
    gridBackgroundColor: processColor('#1E1E1E'),

    xAxis: {
      enabled: true,
      drawGridLines: showGrid,
      gridColor: processColor('#333333'),
      textColor: processColor('#FFFFFF'),
      position: 'BOTTOM',
      granularity: 1,
      granularityEnabled: true,
    },

    yAxis: {
      left: {
        enabled: true,
        drawGridLines: showGrid,
        gridColor: processColor('#333333'),
        textColor: processColor('#FFFFFF'),
        position: 'OUTSIDE_CHART',
      },
      right: {
        enabled: false,
      },
    },

    legend: {
      enabled: true,
      textColor: processColor('#FFFFFF'),
      position: 'BELOW_CHART_CENTER',
    },

    description: {
      text: '',
    },

    scaleEnabled: true,
    dragEnabled: true,
    pinchZoom: true,
    maxHighlightDistance: 300,

    marker: {
      enabled: true,
      markerColor: processColor('#FFBB33'),
      textColor: processColor('#FFFFFF'),
    },
  };

  const handleSelect = (event: any) => {
    if (event?.nativeEvent) {
      console.log('Chart selection:', event.nativeEvent);
      // Handle chart point selection if needed
    }
  };

  const handleChartTranslate = (event: any) => {
    if (event?.nativeEvent) {
      const { x } = event.nativeEvent;
      dispatch(setPanOffset(x));
    }
  };

  const handleChartScale = (event: any) => {
    if (event?.nativeEvent) {
      const { scaleX } = event.nativeEvent;
      dispatch(setZoomLevel(scaleX));
    }
  };

  const handleChartDoubleClick = () => {
    dispatch(resetChart());
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.noDataContainer}>
          <CandleStickChart style={styles.chart} data={chartData} {...chartConfig} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <CandleStickChart
        style={styles.chart}
        data={chartData}
        {...chartConfig}
        onSelect={handleSelect}
        onChange={handleChartTranslate}
        onChartScale={handleChartScale}
        onChartGestureEnd={handleChartDoubleClick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  chart: {
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
