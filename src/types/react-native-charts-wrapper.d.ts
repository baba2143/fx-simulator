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

  export interface LineChartProps extends ViewProps, ChartConfig {
    data: {
      dataSets: Array<{
        values: Array<{ x: number; y: number }>;
        label: string;
        config: {
          color?: string;
          lineWidth?: number;
          drawCircles?: boolean;
          drawValues?: boolean;
          mode?: string;
          fillColor?: string;
          fillAlpha?: number;
          drawFilled?: boolean;
          enableDashedLine?: boolean;
          dashedLine?: {
            lineLength: number;
            spaceLength: number;
          };
        };
      }>;
    };
  }

  export class LineChart extends Component<LineChartProps> {}

  export interface PieChartProps extends ViewProps {
    data: {
      dataSets: Array<{
        values: Array<{ value: number; label: string }>;
        label: string;
        config: {
          colors?: string[];
          valueTextSize?: number;
          valueTextColor?: string;
          sliceSpace?: number;
        };
      }>;
    };
    backgroundColor?: string;
    legend?: {
      enabled?: boolean;
      textColor?: string;
      position?: string;
    };
    description?: {
      text?: string;
    };
  }

  export class PieChart extends Component<PieChartProps> {}
}
