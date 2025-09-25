import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DrawingTool = 'none' | 'trendline' | 'rectangle' | 'text' | 'fibonacci';

export interface Point {
  x: number;
  y: number;
  price: number;
  timestamp: number;
}

export interface Drawing {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  lineWidth: number;
  text?: string;
  completed: boolean;
  visible: boolean;
  createdAt: number;
}

export interface DrawingState {
  activeTool: DrawingTool;
  drawings: Drawing[];
  tempDrawing: Drawing | null; // 描画中の一時的なオブジェクト
  selectedDrawingId: string | null;
  colors: string[];
  currentColor: string;
  currentLineWidth: number;
  showDrawings: boolean;
}

const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#F7DC6F', // Light Yellow
  '#85C1E9', // Light Blue
];

const initialState: DrawingState = {
  activeTool: 'none',
  drawings: [],
  tempDrawing: null,
  selectedDrawingId: null,
  colors: DEFAULT_COLORS,
  currentColor: DEFAULT_COLORS[0],
  currentLineWidth: 2,
  showDrawings: true,
};

export const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<DrawingTool>) => {
      state.activeTool = action.payload;
      state.selectedDrawingId = null;
      state.tempDrawing = null;
    },
    startDrawing: (state, action: PayloadAction<{ point: Point; type: DrawingTool }>) => {
      const { point, type } = action.payload;
      state.tempDrawing = {
        id: `temp_${Date.now()}`,
        type,
        points: [point],
        color: state.currentColor,
        lineWidth: state.currentLineWidth,
        completed: false,
        visible: true,
        createdAt: Date.now(),
      };
    },
    updateTempDrawing: (state, action: PayloadAction<Point>) => {
      if (state.tempDrawing && state.tempDrawing.points.length > 0) {
        // 最後のポイントを更新（ドラッグ中）
        if (state.tempDrawing.points.length === 1) {
          state.tempDrawing.points.push(action.payload);
        } else {
          state.tempDrawing.points[state.tempDrawing.points.length - 1] = action.payload;
        }
      }
    },
    completeDrawing: state => {
      if (state.tempDrawing) {
        const completed: Drawing = {
          ...state.tempDrawing,
          id: `drawing_${Date.now()}`,
          completed: true,
        };
        state.drawings.push(completed);
        state.tempDrawing = null;
        state.activeTool = 'none';
      }
    },
    cancelDrawing: state => {
      state.tempDrawing = null;
      state.activeTool = 'none';
    },
    addDrawing: (state, action: PayloadAction<Omit<Drawing, 'id' | 'createdAt'>>) => {
      const drawing: Drawing = {
        ...action.payload,
        id: `drawing_${Date.now()}`,
        createdAt: Date.now(),
      };
      state.drawings.push(drawing);
    },
    removeDrawing: (state, action: PayloadAction<string>) => {
      state.drawings = state.drawings.filter(drawing => drawing.id !== action.payload);
      if (state.selectedDrawingId === action.payload) {
        state.selectedDrawingId = null;
      }
    },
    selectDrawing: (state, action: PayloadAction<string | null>) => {
      state.selectedDrawingId = action.payload;
    },
    updateDrawing: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Drawing> }>,
    ) => {
      const { id, updates } = action.payload;
      const drawingIndex = state.drawings.findIndex(d => d.id === id);
      if (drawingIndex !== -1) {
        state.drawings[drawingIndex] = { ...state.drawings[drawingIndex], ...updates };
      }
    },
    moveDrawing: (state, action: PayloadAction<{ id: string; deltaX: number; deltaY: number }>) => {
      const { id, deltaX, deltaY } = action.payload;
      const drawing = state.drawings.find(d => d.id === id);
      if (drawing) {
        drawing.points = drawing.points.map(point => ({
          ...point,
          x: point.x + deltaX,
          y: point.y + deltaY,
        }));
      }
    },
    toggleDrawingVisibility: (state, action: PayloadAction<string>) => {
      const drawing = state.drawings.find(d => d.id === action.payload);
      if (drawing) {
        drawing.visible = !drawing.visible;
      }
    },
    setCurrentColor: (state, action: PayloadAction<string>) => {
      state.currentColor = action.payload;
    },
    setCurrentLineWidth: (state, action: PayloadAction<number>) => {
      state.currentLineWidth = action.payload;
    },
    toggleShowDrawings: state => {
      state.showDrawings = !state.showDrawings;
    },
    clearAllDrawings: state => {
      state.drawings = [];
      state.tempDrawing = null;
      state.selectedDrawingId = null;
    },
    duplicateDrawing: (state, action: PayloadAction<string>) => {
      const originalDrawing = state.drawings.find(d => d.id === action.payload);
      if (originalDrawing) {
        const duplicated: Drawing = {
          ...originalDrawing,
          id: `drawing_${Date.now()}`,
          createdAt: Date.now(),
          points: originalDrawing.points.map(point => ({
            ...point,
            x: point.x + 20, // 少しずらして配置
            y: point.y + 20,
          })),
        };
        state.drawings.push(duplicated);
      }
    },
  },
});

export const {
  setActiveTool,
  startDrawing,
  updateTempDrawing,
  completeDrawing,
  cancelDrawing,
  addDrawing,
  removeDrawing,
  selectDrawing,
  updateDrawing,
  moveDrawing,
  toggleDrawingVisibility,
  setCurrentColor,
  setCurrentLineWidth,
  toggleShowDrawings,
  clearAllDrawings,
  duplicateDrawing,
} = drawingSlice.actions;

export default drawingSlice.reducer;