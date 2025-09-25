declare module 'react-native-charts-wrapper' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface ChartData {
    dataSets: Array<{
      values: Array<{
        x: number;
        shadowH: number;
        shadowL: number;
        open: number;
        close: number;
      }>;
      label: string;
      config: {
        color?: string;
        increasingColor?: string;
        decreasingColor?: string;
        increasingPaintStyle?: string;
        decreasingPaintStyle?: string;
        shadowColor?: string;
        shadowWidth?: number;
        showCandleBar?: boolean;
        barSpace?: number;
      };
    }>;
  }

  export interface ChartConfig {
    backgroundColor?: string;
    gridBackgroundColor?: string;
    xAxis?: {
      enabled?: boolean;
      drawGridLines?: boolean;
      gridColor?: string;
      textColor?: string;
      position?: string;
      granularity?: number;
      granularityEnabled?: boolean;
    };
    yAxis?: {
      left?: {
        enabled?: boolean;
        drawGridLines?: boolean;
        gridColor?: string;
        textColor?: string;
        position?: string;
      };
      right?: {
        enabled?: boolean;
      };
    };
    legend?: {
      enabled?: boolean;
      textColor?: string;
      position?: string;
    };
    description?: {
      text?: string;
    };
    scaleEnabled?: boolean;
    dragEnabled?: boolean;
    pinchZoom?: boolean;
    maxHighlightDistance?: number;
    marker?: {
      enabled?: boolean;
      markerColor?: string;
      textColor?: string;
    };
  }

  export interface CandleStickChartProps extends ViewProps, ChartConfig {
    data: ChartData;
    onSelect?: (event: any) => void;
    onChange?: (event: any) => void;
    onChartScale?: (event: any) => void;
    onChartGestureEnd?: (event: any) => void;
  }

  export class CandleStickChart extends Component<CandleStickChartProps> {}
}
