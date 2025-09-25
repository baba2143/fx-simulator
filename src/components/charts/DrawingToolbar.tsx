import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setActiveTool,
  setCurrentColor,
  setCurrentLineWidth,
  clearAllDrawings,
  toggleShowDrawings,
  DrawingTool,
} from '../../store/slices/drawingSlice';

interface DrawingToolbarProps {
  visible: boolean;
  onClose: () => void;
}

const DRAWING_TOOLS: { tool: DrawingTool; label: string; icon: string }[] = [
  { tool: 'none', label: 'カーソル', icon: '↖' },
  { tool: 'trendline', label: 'トレンドライン', icon: '📈' },
  { tool: 'rectangle', label: '矩形', icon: '◼' },
  { tool: 'text', label: 'テキスト', icon: 'T' },
  { tool: 'fibonacci', label: 'フィボナッチ', icon: 'φ' },
];

const LINE_WIDTHS = [1, 2, 3, 4, 5];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeTool, colors, currentColor, currentLineWidth, showDrawings, drawings } =
    useSelector((state: RootState) => state.drawing);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLineWidthPicker, setShowLineWidthPicker] = useState(false);

  const handleToolSelect = (tool: DrawingTool) => {
    dispatch(setActiveTool(tool));
  };

  const handleColorSelect = (color: string) => {
    dispatch(setCurrentColor(color));
    setShowColorPicker(false);
  };

  const handleLineWidthSelect = (width: number) => {
    dispatch(setCurrentLineWidth(width));
    setShowLineWidthPicker(false);
  };

  const handleClearAll = () => {
    dispatch(clearAllDrawings());
  };

  const handleToggleShowDrawings = () => {
    dispatch(toggleShowDrawings());
  };

  const ColorPickerModal = () => (
    <Modal visible={showColorPicker} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.colorPicker}>
          <Text style={styles.pickerTitle}>色を選択</Text>
          <View style={styles.colorGrid}>
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColorOption,
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowColorPicker(false)}>
            <Text style={styles.pickerCancelText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LineWidthPickerModal = () => (
    <Modal visible={showLineWidthPicker} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.lineWidthPicker}>
          <Text style={styles.pickerTitle}>線の太さ</Text>
          {LINE_WIDTHS.map(width => (
            <TouchableOpacity
              key={width}
              style={[styles.lineWidthOption, currentLineWidth === width && styles.selectedOption]}
              onPress={() => handleLineWidthSelect(width)}
            >
              <View style={[styles.linePreview, { height: width * 2, backgroundColor: currentColor }]} />
              <Text style={styles.lineWidthText}>{width}px</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.pickerCancel}
            onPress={() => setShowLineWidthPicker(false)}
          >
            <Text style={styles.pickerCancelText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>描画ツール</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>ツール</Text>
            <View style={styles.toolGrid}>
              {DRAWING_TOOLS.map(({ tool, label, icon }) => (
                <TouchableOpacity
                  key={tool}
                  style={[styles.toolButton, activeTool === tool && styles.selectedTool]}
                  onPress={() => handleToolSelect(tool)}
                >
                  <Text style={styles.toolIcon}>{icon}</Text>
                  <Text style={styles.toolLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>スタイル</Text>
            <View style={styles.styleControls}>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => setShowColorPicker(true)}
              >
                <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
                <Text style={styles.controlLabel}>色</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lineWidthButton}
                onPress={() => setShowLineWidthPicker(true)}
              >
                <View
                  style={[
                    styles.lineWidthPreview,
                    { height: currentLineWidth * 2, backgroundColor: currentColor },
                  ]}
                />
                <Text style={styles.controlLabel}>太さ: {currentLineWidth}px</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>操作</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleToggleShowDrawings}>
                <Text style={styles.actionButtonText}>
                  {showDrawings ? '描画を非表示' : '描画を表示'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleClearAll}
                disabled={drawings.length === 0}
              >
                <Text style={[styles.actionButtonText, { opacity: drawings.length === 0 ? 0.5 : 1 }]}>
                  すべて削除
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.info}>
              <Text style={styles.infoText}>描画数: {drawings.length}</Text>
              <Text style={styles.infoText}>表示: {showDrawings ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ColorPickerModal />
      <LineWidthPickerModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#48484A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTool: {
    borderColor: '#007AFF',
    backgroundColor: '#1A365F',
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  styleControls: {
    flexDirection: 'row',
    gap: 16,
  },
  colorButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lineWidthButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  lineWidthPreview: {
    width: 40,
    borderRadius: 2,
    marginBottom: 8,
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#48484A',
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPicker: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FFFFFF',
  },
  lineWidthPicker: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    width: '70%',
    maxWidth: 250,
  },
  lineWidthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 16,
  },
  selectedOption: {
    backgroundColor: '#2C2C2E',
  },
  linePreview: {
    width: 60,
    borderRadius: 2,
  },
  lineWidthText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  pickerCancel: {
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  pickerCancelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});